"use client";

import { TransformControls } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { DoubleSide, Group, Quaternion, Vector3 } from "three";
import {
  parseSceneConfiguration,
  serializeSceneConfiguration,
} from "./config/sceneSerialization";
import type {
  CubeStudioConfiguration,
  SceneCameraStop,
  SceneConfiguration,
  SceneLight,
  SceneObjectInstance,
  SceneObjectTransform,
  SceneEnvironment,
  SceneInteractionAction,
  ScenePrimitiveType,
  SceneObjectAnimation,
  SceneObjectPresetAnimation,
} from "./config/sceneTypes";
import { PRESET_ANIMATION_OPTIONS } from "./animations";
import { assetRegistry } from "./registry/assetRegistry";
import type { VectorTuple, TransformMode } from "./deskSceneLayout";

export type EditorTab = "objects" | "lights" | "environment" | "camera" | "configuration";
type TransformSpace = "world" | "local";
type LightType = SceneLight["type"];

const presetsKey = "malay-portfolio-scene-presets-v1";
const defaultCubeStudio: CubeStudioConfiguration = {
  enabled: true,
  cubeSize: 36,
  position: [0, 80, 0],
  interiorColor: "#050508",
  roughness: 0.95,
  metalness: 0.05,
  cameraDistance: 3.8,
  cameraHeight: 1.2,
  transitionDuration: 2.2,
  lights: [],
  objects: [],
};
const panelClass =
  "rounded-xl border-2 border-surface-variant bg-surface-container-lowest p-3 sm:p-4 text-on-surface shadow-[4px_4px_0px_#080d22] box-border";
const inputClass =
  "w-full min-w-0 rounded-md border border-outline-variant bg-surface-container-low px-2 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors";
const buttonClass =
  "rounded-md border border-outline-variant bg-surface-container-low px-2 py-1.5 text-xs hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition-colors cursor-pointer";

let idCounter = 0;
function uniqueId(prefix: string) {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${++idCounter}`;
  return `${prefix}-${suffix}`;
}

function copyVector(vector: VectorTuple): VectorTuple {
  return [vector[0], vector[1], vector[2]];
}

function newLight(type: LightType): SceneLight {
  const common = {
    id: uniqueId(type),
    name: `New ${type} light`,
    enabled: true,
    visible: true,
    color: "#ffffff",
    intensity: 1,
  };

  switch (type) {
    case "ambient":
      return { ...common, type };
    case "hemisphere":
      return { ...common, type, groundColor: "#453b39" };
    case "directional":
      return {
        ...common,
        type,
        position: [3, 5, 3],
        target: [0, 0, 0],
        shadows: false,
      };
    case "point":
      return {
        ...common,
        type,
        position: [0, 3, 0],
        distance: 0,
        decay: 2,
        shadows: false,
      };
    case "spot":
      return {
        ...common,
        type,
        position: [0, 4, 0],
        target: [0, 0, 0],
        angle: Math.PI / 6,
        penumbra: 0.2,
        distance: 0,
        decay: 2,
        shadows: false,
      };
    case "rectArea":
      return {
        ...common,
        type,
        position: [0, 3, 0],
        rotation: [-90, 0, 0],
        width: 2,
        height: 1,
      };
  }
}

function patchLight<T extends SceneLight>(light: T, patch: Partial<T>): T {
  return { ...light, ...patch };
}

function newInteractionAction(type: SceneInteractionAction["type"]): SceneInteractionAction {
  switch (type) {
    case "playAudio":
      return { type, audio: "", volume: 0.8, loop: false };
    case "stopAudio":
      return { type };
    case "playAnimation":
      return { type, animation: "", loop: false, timeScale: 1, duration: 2 };
    case "openModal":
      return { type, modal: "scene-modal", title: "Scene information", content: "" };
    case "openUrl":
      return { type, url: "", target: "_blank" };
    case "showInformation":
      return { type, title: "Information", content: "" };
    case "focusObject":
      return { type, duration: 1.5 };
    case "enterCubeView":
      return { type, duration: 1.5, cameraDistance: 3.8, cameraHeight: 1.2 };
    case "customAction":
      return { type, name: "" };
  }
}
export function SceneTransformGizmo({
  active,
  object,
  mode,
  space,
  snapEnabled,
  onCommit,
}: {
  active: boolean;
  object: Group | null;
  mode: TransformMode;
  space: TransformSpace;
  snapEnabled: boolean;
  onCommit: () => void;
}) {
  if (!active || !object) return null;

  return (
    <TransformControls
      object={object}
      mode={mode}
      onMouseUp={onCommit}
      size={0.8}
      space={space}
      translationSnap={snapEnabled ? 0.1 : undefined}
      rotationSnap={snapEnabled ? Math.PI / 12 : undefined}
      scaleSnap={snapEnabled ? 0.1 : undefined}
    />
  );
}

function LightDirectionArrow({
  start,
  end,
  color = "#ffd700",
}: {
  start: VectorTuple;
  end: VectorTuple;
  color?: string;
}) {
  const p1 = new Vector3(...start);
  const p2 = new Vector3(...end);
  const dir = new Vector3().subVectors(p2, p1);
  const len = dir.length();
  if (len < 0.05) return null;

  const unitDir = dir.clone().normalize();
  const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), unitDir);
  const headLength = Math.min(0.35, len * 0.35);
  const shaftLength = Math.max(0.01, len - headLength);
  const shaftPos = p1.clone().add(unitDir.clone().multiplyScalar(shaftLength / 2));
  const headPos = p1.clone().add(unitDir.clone().multiplyScalar(shaftLength + headLength / 2));

  return (
    <group>
      <mesh position={shaftPos} quaternion={quat}>
        <cylinderGeometry args={[0.02, 0.02, shaftLength, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={headPos} quaternion={quat}>
        <coneGeometry args={[0.08, headLength, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export function SceneLightGizmo({
  active,
  light,
  mode = "translate",
  space = "world",
  snapEnabled = false,
  lightTargetMode = "position",
  onCommitPosition,
  onCommitTarget,
  onCommitRotation,
  inCubeStudio = false,
  cubeStudioPosition = [0, 80, 0],
}: {
  active: boolean;
  light?: SceneLight | null;
  mode?: TransformMode;
  space?: TransformSpace;
  snapEnabled?: boolean;
  lightTargetMode?: "position" | "target";
  onCommitPosition?: (newPosition: VectorTuple) => void;
  onCommitTarget?: (newTarget: VectorTuple) => void;
  onCommitRotation?: (newRotation: VectorTuple) => void;
  inCubeStudio?: boolean;
  cubeStudioPosition?: VectorTuple;
}) {
  const [anchorNode, setAnchorNode] = useState<Group | null>(null);
  const posGroupRef = useRef<Group | null>(null);
  const targetGroupRef = useRef<Group | null>(null);
  const isDragging = useRef(false);

  const hasPosition = Boolean(light && "position" in light);
  const hasTarget = Boolean(light && "target" in light);
  const position = hasPosition && light && "position" in light ? light.position : null;
  const target = hasTarget && light && "target" in light ? light.target : null;

  const [dragPos, setDragPos] = useState<VectorTuple | null>(null);
  const [dragTarget, setDragTarget] = useState<VectorTuple | null>(null);

  const currentPos = dragPos ?? position ?? [0, 0, 0];
  const currentTarget = dragTarget ?? target ?? [0, 0, 0];

  useEffect(() => {
    if (!light || !hasPosition || isDragging.current) return;
    if (posGroupRef.current && "position" in light) {
      posGroupRef.current.position.set(...light.position);
      if (light.type === "rectArea") {
        posGroupRef.current.rotation.set(
          (light.rotation[0] * Math.PI) / 180,
          (light.rotation[1] * Math.PI) / 180,
          (light.rotation[2] * Math.PI) / 180,
        );
      }
    }
    if (targetGroupRef.current && "target" in light) {
      targetGroupRef.current.position.set(...light.target);
    }
  }, [light, hasPosition]);

  useEffect(() => {
    if (lightTargetMode === "target" && hasTarget) {
      setAnchorNode(targetGroupRef.current);
    } else {
      setAnchorNode(posGroupRef.current);
    }
  }, [lightTargetMode, hasTarget, light?.id]);

  if (!active || !light || !position) return null;

  const handleCommit = () => {
    isDragging.current = false;
    setDragPos(null);
    setDragTarget(null);
    if (lightTargetMode === "target" && hasTarget && targetGroupRef.current) {
      const p = targetGroupRef.current.position;
      onCommitTarget?.([p.x, p.y, p.z]);
    } else if (posGroupRef.current) {
      const p = posGroupRef.current.position;
      onCommitPosition?.([p.x, p.y, p.z]);
      if (light.type === "rectArea" && mode === "rotate") {
        const r = posGroupRef.current.rotation;
        onCommitRotation?.([
          (r.x * 180) / Math.PI,
          (r.y * 180) / Math.PI,
          (r.z * 180) / Math.PI,
        ]);
      }
    }
  };

  const lightColor = light.color || "#ffea00";

  return (
    <group position={inCubeStudio ? cubeStudioPosition : [0, 0, 0]}>
      {/* Light Position Anchor */}
      <group
        position={position}
        ref={(node) => {
          posGroupRef.current = node;
          if (lightTargetMode !== "target" && node && anchorNode !== node) {
            setAnchorNode(node);
          }
        }}
      >
        {/* Glowing bulb icon marker */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color={lightColor} wireframe />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={lightColor} />
        </mesh>

        {/* Omnidirectional radiating indicator for point lights */}
        {light.type === "point" && <axesHelper args={[0.4]} />}

        {/* Rect area light planar indicator */}
        {light.type === "rectArea" && (
          <group>
            <mesh>
              <planeGeometry args={[light.width, light.height]} />
              <meshBasicMaterial color={lightColor} side={DoubleSide} wireframe />
            </mesh>
          </group>
        )}
      </group>

      {/* Target Anchor (for directional and spot lights) */}
      {hasTarget && target && (
        <group
          position={target}
          ref={(node) => {
            targetGroupRef.current = node;
            if (lightTargetMode === "target" && node && anchorNode !== node) {
              setAnchorNode(node);
            }
          }}
        >
          {/* Target marker ring & crosshair */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.22, 24]} />
            <meshBasicMaterial color={lightColor} side={DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={lightColor} />
          </mesh>
        </group>
      )}

      {/* 3D Directional Indicator Arrow pointing from light position to target */}
      {hasTarget && (
        <LightDirectionArrow
          start={currentPos}
          end={currentTarget}
          color={lightColor}
        />
      )}

      {/* TransformControls: 3D Indicator Arrows attached to selected target (Position or Direction Target) */}
      {anchorNode && (
        <TransformControls
          mode={light.type === "rectArea" ? mode : "translate"}
          object={anchorNode}
          onMouseDown={() => {
            isDragging.current = true;
          }}
          onObjectChange={() => {
            if (lightTargetMode === "target" && targetGroupRef.current) {
              const p = targetGroupRef.current.position;
              setDragTarget([p.x, p.y, p.z]);
            } else if (posGroupRef.current) {
              const p = posGroupRef.current.position;
              setDragPos([p.x, p.y, p.z]);
            }
          }}
          onMouseUp={handleCommit}
          rotationSnap={snapEnabled ? Math.PI / 12 : undefined}
          size={0.75}
          space={space}
          translationSnap={snapEnabled ? 0.1 : undefined}
        />
      )}
    </group>
  );
}

export function DeskSceneEditor({
  open,
  onOpenChange,
  selected,
  onSelectedChange,
  mode,
  onModeChange,
  transformSpace,
  onTransformSpaceChange,
  snapEnabled,
  onSnapEnabledChange,
  configuration,
  onConfigurationChange,
  onPlacementChange,
  onCameraStopChange,
  onResetSelected,
  onDeleteObject,
  onResetAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  expanded,
  onExpandedChange,
  embeddedAnimations,
  cubeStudioActive = false,
  onToggleCubeStudio,
  cubeStudioTargetId,
  tab: tabProp,
  onTabChange,
  selectedLight: selectedLightProp,
  onSelectedLightChange,
  lightTargetMode = "position",
  onLightTargetModeChange,
  isStageVisible = true,
  isMobilePortrait = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string;
  onSelectedChange: (id: string) => void;
  mode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  transformSpace: TransformSpace;
  onTransformSpaceChange: (space: TransformSpace) => void;
  snapEnabled: boolean;
  onSnapEnabledChange: (enabled: boolean) => void;
  configuration: SceneConfiguration;
  onConfigurationChange: (
    update: (configuration: SceneConfiguration) => SceneConfiguration,
  ) => void;
  onPlacementChange: (id: string, transform: SceneObjectTransform) => void;
  onCameraStopChange: (index: number, stop: SceneCameraStop) => void;
  onResetSelected: (id: string) => void;
  onDeleteObject?: (id: string) => void;
  onResetAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  embeddedAnimations: Record<string, string[]>;
  cubeStudioActive?: boolean;
  onToggleCubeStudio?: () => void;
  cubeStudioTargetId?: string | null;
  tab?: EditorTab;
  onTabChange?: (tab: EditorTab) => void;
  selectedLight?: string;
  onSelectedLightChange?: (id: string) => void;
  lightTargetMode?: "position" | "target";
  onLightTargetModeChange?: (mode: "position" | "target") => void;
  isStageVisible?: boolean;
  isMobilePortrait?: boolean;
}) {
  const [localTab, setLocalTab] = useState<EditorTab>("objects");
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);

  const handleEditClick = () => {
    if (!open && isMobilePortrait) {
      setShowOrientationWarning(true);
      setTimeout(() => setShowOrientationWarning(false), 5000);
      return;
    }
    onOpenChange(!open);
  };
  const tab = tabProp ?? localTab;
  const setTab = (nextTab: EditorTab) => {
    setLocalTab(nextTab);
    onTabChange?.(nextTab);
  };
  const [search, setSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetToAdd, setAssetToAdd] = useState("");
  const [lightTypeToAdd, setLightTypeToAdd] = useState<LightType>("point");
  const [localSelectedLight, setLocalSelectedLight] = useState(
    configuration.lights[0]?.id ?? "",
  );
  const selectedLight = selectedLightProp ?? localSelectedLight;
  const setSelectedLight = useCallback((id: string) => {
    setLocalSelectedLight(id);
    onSelectedLightChange?.(id);
  }, [onSelectedLightChange]);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "info" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: msg, type });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3200);
  }, []);
  const [importText, setImportText] = useState("");
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [presets, setPresets] = useState<Record<string, SceneConfiguration>>({});
  const [actionTypeToAdd, setActionTypeToAdd] = useState<SceneInteractionAction["type"]>("showInformation");
  const [primitiveType, setPrimitiveType] = useState<ScenePrimitiveType>("box");
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; panelX: number; panelY: number } | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("malay-scene-editor-width");
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val >= 320 && val <= 850) return val;
        }
        return Math.min(460, Math.max(320, window.innerWidth - 32));
      } catch {
        return 460;
      }
    }
    return 460;
  });
  const widthResizeStart = useRef<{ clientX: number; initialWidth: number } | null>(null);
  const [preserveTextureOption, setPreserveTextureOption] = useState(false);

  const activeObjectsList = cubeStudioActive
    ? [
        ...((cubeStudioTargetId || (selected && selected !== "room")) &&
        !(configuration.cubeStudio?.objects ?? []).some(
          (o) => o.id === (cubeStudioTargetId || selected),
        )
          ? configuration.objects.filter((o) => o.id === (cubeStudioTargetId || selected))
          : []),
        ...(configuration.cubeStudio?.objects ?? []),
      ]
    : configuration.objects;
  const activeLightsList = cubeStudioActive
    ? (configuration.cubeStudio?.lights ?? [])
    : configuration.lights;

  const selectedObject =
    activeObjectsList.find((object) => object.id === selected && object.id !== "room") ??
    activeObjectsList.find((object) => object.id !== "room") ??
    activeObjectsList[0];
  const filteredObjects = activeObjectsList.filter((object) =>
    object.id !== "room" &&
    `${object.name} ${object.assetId}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredLights = activeLightsList.filter((light) =>
    `${light.name} ${light.type}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedAsset = selectedObject
    ? assetRegistry.find((asset) => asset.id === selectedObject.assetId)
    : undefined;
  const selectedLightItem =
    activeLightsList.find((light) => light.id === selectedLight) ??
    activeLightsList[0];

  const handleToggleScene = useCallback(() => {
    if (!onToggleCubeStudio) return;
    if (cubeStudioActive) {
      const firstDesk = configuration.objects.find((o) => o.id !== "room");
      if (firstDesk) onSelectedChange(firstDesk.id);
      if (configuration.lights[0]) setSelectedLight(configuration.lights[0].id);
    } else {
      const targetId =
        selected && selected !== "room"
          ? selected
          : configuration.cubeStudio?.objects?.[0]?.id;
      if (targetId) onSelectedChange(targetId);
      const firstCubeLight = configuration.cubeStudio?.lights?.[0];
      if (firstCubeLight) setSelectedLight(firstCubeLight.id);
    }
    onToggleCubeStudio();
  }, [cubeStudioActive, selected, configuration.objects, configuration.lights, configuration.cubeStudio?.objects, configuration.cubeStudio?.lights, onSelectedChange, onToggleCubeStudio, setSelectedLight]);

  function loadSavedPresets() {
    try {
      const savedPresets = localStorage.getItem(presetsKey);
      if (savedPresets) {
        const parsed: unknown = JSON.parse(savedPresets);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("Saved scene presets must be an object.");
        }
        const validPresets: Record<string, SceneConfiguration> = {};
        for (const [name, value] of Object.entries(parsed)) {
          validPresets[name] = parseSceneConfiguration(JSON.stringify(value));
        }
        setPresets(validPresets);
        setMessage(`Loaded ${Object.keys(validPresets).length} saved presets.`);
      } else {
        setPresets({});
        setMessage("No saved presets found in this browser.");
      }
    } catch (error) {
      setMessage(
        `Could not load saved presets: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  function InteractionActionFields({
    action,
    index,
    count,
    onChange,
    onMove,
    onDuplicate,
    onRemove,
  }: {
    action: SceneInteractionAction;
    index: number;
    count: number;
    onChange: (action: SceneInteractionAction) => void;
    onMove: (direction: -1 | 1) => void;
    onDuplicate: () => void;
    onRemove: () => void;
  }) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-bold"><span className="material-symbols-outlined mr-1 align-middle text-base">ads_click</span>{action.type}</span>
          <div className="flex gap-1">
            <button aria-label={`Move action ${index + 1} up`} className={buttonClass} disabled={index === 0} onClick={() => onMove(-1)} type="button">Up</button>
            <button aria-label={`Move action ${index + 1} down`} className={buttonClass} disabled={index === count - 1} onClick={() => onMove(1)} type="button">Down</button>
            <button aria-label={`Duplicate action ${index + 1}`} className={buttonClass} onClick={onDuplicate} type="button">Duplicate</button>
            <button aria-label={`Remove action ${index + 1}`} className={buttonClass} onClick={onRemove} type="button">Remove</button>
          </div>
        </div>
        {action.type === "playAudio" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label>Audio path<input className={inputClass} value={action.audio} onChange={(event) => onChange({ ...action, audio: event.target.value })} /></label>
            <label>Volume<input className={inputClass} max={1} min={0} step={0.05} type="range" value={action.volume ?? 0.8} onChange={(event) => onChange({ ...action, volume: Number(event.target.value) })} /></label>
            <label className="flex items-center gap-2"><input checked={action.loop ?? false} type="checkbox" onChange={(event) => onChange({ ...action, loop: event.target.checked })} />Loop</label>
          </div>
        )}
        {action.type === "stopAudio" && (
          <label>Audio instance ID<input className={inputClass} value={action.id ?? ""} onChange={(event) => onChange({ ...action, id: event.target.value || undefined })} /></label>
        )}
        {action.type === "playAnimation" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label>Animation name<input className={inputClass} value={action.animation} onChange={(event) => onChange({ ...action, animation: event.target.value })} /></label>
            <label>Speed<input className={inputClass} min={0.1} step={0.1} type="number" value={action.timeScale ?? 1} onChange={(event) => onChange({ ...action, timeScale: Number(event.target.value) })} /></label>
            <label>Duration (seconds)<input className={inputClass} min={0.1} step={0.1} type="number" value={action.duration ?? 2} onChange={(event) => onChange({ ...action, duration: Number(event.target.value) })} /></label>
            <label className="flex items-center gap-2"><input checked={action.loop ?? false} type="checkbox" onChange={(event) => onChange({ ...action, loop: event.target.checked })} />Loop</label>
          </div>
        )}
        {action.type === "openModal" && (
          <div className="grid gap-2">
            <label>Modal ID<input className={inputClass} value={action.modal} onChange={(event) => onChange({ ...action, modal: event.target.value })} /></label>
            <label>Title<input className={inputClass} value={action.title ?? ""} onChange={(event) => onChange({ ...action, title: event.target.value })} /></label>
            <label>Content<textarea className={inputClass} value={action.content ?? ""} onChange={(event) => onChange({ ...action, content: event.target.value })} /></label>
          </div>
        )}
        {action.type === "openUrl" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label>URL<input className={inputClass} value={action.url} onChange={(event) => onChange({ ...action, url: event.target.value })} /></label>
            <label>Target<select className={inputClass} value={action.target ?? "_blank"} onChange={(event) => onChange({ ...action, target: event.target.value as "_self" | "_blank" })}><option value="_blank">New tab</option><option value="_self">Same tab</option></select></label>
          </div>
        )}
        {action.type === "showInformation" && (
          <div className="grid gap-2">
            <label>Title<input className={inputClass} value={action.title} onChange={(event) => onChange({ ...action, title: event.target.value })} /></label>
            <label>Content<textarea className={inputClass} value={action.content} onChange={(event) => onChange({ ...action, content: event.target.value })} /></label>
          </div>
        )}
        {action.type === "focusObject" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label>Target object ID<input className={inputClass} value={action.objectId ?? ""} onChange={(event) => onChange({ ...action, objectId: event.target.value || undefined })} /></label>
            <label>Duration (seconds)<input className={inputClass} min={0.1} step={0.1} type="number" value={action.duration ?? 1.5} onChange={(event) => onChange({ ...action, duration: Number(event.target.value) })} /></label>
          </div>
        )}
        {action.type === "enterCubeView" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label>Target object ID<input className={inputClass} placeholder="(Current object)" value={action.targetObjectId ?? ""} onChange={(event) => onChange({ ...action, targetObjectId: event.target.value || undefined })} /></label>
            <label>Transition duration (s)<input className={inputClass} min={0.2} step={0.1} type="number" value={action.duration ?? 1.5} onChange={(event) => onChange({ ...action, duration: Number(event.target.value) })} /></label>
            <label>Camera distance<input className={inputClass} min={1} step={0.5} type="number" value={action.cameraDistance ?? 3.8} onChange={(event) => onChange({ ...action, cameraDistance: Number(event.target.value) })} /></label>
            <label>Camera height<input className={inputClass} step={0.2} type="number" value={action.cameraHeight ?? 1.2} onChange={(event) => onChange({ ...action, cameraHeight: Number(event.target.value) })} /></label>
          </div>
        )}
        {action.type === "customAction" && (
          <label>Controlled action name<input className={inputClass} value={action.name} onChange={(event) => onChange({ ...action, name: event.target.value })} /></label>
        )}
      </div>
    );
  }

  function updateObject(id: string, update: (object: SceneObjectInstance) => SceneObjectInstance) {
    onConfigurationChange((current) => {
      if (cubeStudioActive) {
        const cubeObjs = current.cubeStudio?.objects ?? [];
        const inCube = cubeObjs.some((object) => object.id === id);
        if (inCube) {
          return {
            ...current,
            cubeStudio: {
              ...(current.cubeStudio ?? defaultCubeStudio),
              objects: cubeObjs.map((object) =>
                object.id === id ? update(object) : object,
              ),
            },
          };
        }
        const deskObj = current.objects.find((object) => object.id === id);
        if (deskObj) {
          const newCubeObj = update({
            ...deskObj,
            transform: {
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [...deskObj.transform.scale] as VectorTuple,
            },
          });
          return {
            ...current,
            cubeStudio: {
              ...(current.cubeStudio ?? defaultCubeStudio),
              objects: [newCubeObj, ...cubeObjs],
            },
          };
        }
        return current;
      }
      return {
        ...current,
        objects: current.objects.map((object) => (object.id === id ? update(object) : object)),
      };
    });
  }

  function startPanelDrag(event: ReactPointerEvent<HTMLDivElement>) {
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      panelX: panelPosition.x,
      panelY: panelPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePanelDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    setPanelPosition({
      x: dragStart.current.panelX + event.clientX - dragStart.current.x,
      y: dragStart.current.panelY + event.clientY - dragStart.current.y,
    });
  }

  function endPanelDrag() {
    dragStart.current = null;
  }

  function startWidthResize(event: ReactPointerEvent<HTMLDivElement>) {
    widthResizeStart.current = {
      clientX: event.clientX,
      initialWidth: panelWidth,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveWidthResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (!widthResizeStart.current) return;
    const maxAllowed = Math.min(820, window.innerWidth - 24);
    const delta = widthResizeStart.current.clientX - event.clientX;
    const newWidth = Math.max(320, Math.min(widthResizeStart.current.initialWidth + delta, maxAllowed));
    setPanelWidth(newWidth);
    try {
      localStorage.setItem("malay-scene-editor-width", String(newWidth));
    } catch {}
  }

  function endWidthResize() {
    widthResizeStart.current = null;
  }

  useEffect(() => {
    if (!expanded) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExpandedChange(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [expanded, onExpandedChange]);

  function updateSelectedInteractions(
    update: (interactions: NonNullable<SceneObjectInstance["interactions"]>) => NonNullable<SceneObjectInstance["interactions"]>,
  ) {
    if (!selectedObject) return;
    updateObject(selectedObject.id, (object) => {
      const interactions = object.interactions ?? { enabled: false, trigger: "click", actions: [] };
      return { ...object, interactions: update(interactions) };
    });
  }

  function updateLight(id: string, update: (light: SceneLight) => SceneLight) {
    onConfigurationChange((current) => {
      if (cubeStudioActive) {
        return {
          ...current,
          cubeStudio: {
            ...(current.cubeStudio ?? defaultCubeStudio),
            lights: (current.cubeStudio?.lights ?? []).map((light) =>
              light.id === id ? update(light) : light,
            ),
          },
        };
      }
      return {
        ...current,
        lights: current.lights.map((light) => (light.id === id ? update(light) : light)),
      };
    });
  }

  function updateAxis(field: keyof SceneObjectTransform, axis: number, value: string) {
    const objectId = selectedObject?.id;
    if (!objectId) return;
    const key = `${objectId}-${field}-${axis}`;
    setDraftValues((current) => ({ ...current, [key]: value }));
    const number = Number(value);
    if (value.trim() === "" || !Number.isFinite(number)) return;
    if (field === "scale" && number === 0) {
      setMessage("Scale values cannot be zero.");
      return;
    }
    const vector = copyVector(selectedObject.transform[field]);
    vector[axis] = number;
    onPlacementChange(objectId, {
      ...selectedObject.transform,
      [field]: vector,
    });
  }

  function updateCameraAxis(field: "position" | "target", axis: number, value: string) {
    const number = Number(value);
    const stop = configuration.cameraStops[selectedCamera];
    if (value.trim() === "" || !Number.isFinite(number) || !stop) return;
    const vector = copyVector(stop[field]);
    vector[axis] = number;
    onCameraStopChange(selectedCamera, { ...stop, [field]: vector });
  }

  function addObject() {
    const asset = assetRegistry.find((item) => item.id === assetToAdd);
    if (!asset) {
      setMessage("Choose a registered model before adding an object.");
      return;
    }
    const source = selectedObject?.transform.position ?? [0, 0, 0];
    const object: SceneObjectInstance = {
      id: uniqueId(asset.id),
      assetId: asset.id,
      name: asset.displayName,
      enabled: true,
      visible: true,
      castShadow: true,
      receiveShadow: true,
      interactions: { enabled: false, trigger: "click", actions: [] },
      transform: {
        position: cubeStudioActive ? [0, 0, 0] : [source[0] + 0.4, source[1], source[2]],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    };
    if (cubeStudioActive) {
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          objects: [...(current.cubeStudio?.objects ?? []), object],
        },
      }));
    } else {
      onConfigurationChange((current) => ({ ...current, objects: [...current.objects, object] }));
    }
    onSelectedChange(object.id);
    setMessage(`Added ${asset.displayName} to ${cubeStudioActive ? "Cube View" : "Desk Scene"}.`);
  }

  function addPrimitive() {
    const parametersByType: Record<ScenePrimitiveType, Record<string, number>> = {
      box: { width: 1, height: 1, depth: 1 },
      sphere: { radius: 0.5, widthSegments: 32, heightSegments: 16 },
      cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 },
      plane: { width: 1, height: 1 },
      cone: { radius: 0.5, height: 1, radialSegments: 32 },
      torus: { radius: 0.5, tube: 0.15, radialSegments: 16, tubularSegments: 48 },
      capsule: { radius: 0.35, length: 0.8, capSegments: 8, radialSegments: 16 },
      circle: { radius: 0.5, segments: 32 },
      ring: { innerRadius: 0.25, outerRadius: 0.5, thetaSegments: 32 },
    };
    const source = selectedObject?.transform.position ?? [0, 0, 0];
    const object: SceneObjectInstance = {
      id: uniqueId(`primitive-${primitiveType}`),
      assetId: "",
      name: `New ${primitiveType}`,
      enabled: true,
      visible: true,
      castShadow: false,
      receiveShadow: false,
      transform: {
        position: cubeStudioActive ? [0, 0, 0] : [source[0] + 0.4, source[1], source[2]],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      geometry: {
        type: primitiveType,
        parameters: parametersByType[primitiveType],
      },
      material: {
        color: "#ffffff",
        roughness: 0.65,
        metalness: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
        transparent: false,
        opacity: 1,
        wireframe: false,
        side: "front",
      },
      glow: {
        enabled: false,
        color: "#ffffff",
        intensity: 0,
        offsetY: 0,
      },
      interactions: { enabled: false, trigger: "click", actions: [] },
    };
    if (cubeStudioActive) {
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          objects: [...(current.cubeStudio?.objects ?? []), object],
        },
      }));
    } else {
      onConfigurationChange((current) => ({ ...current, objects: [...current.objects, object] }));
    }
    onSelectedChange(object.id);
    setMessage(`Added ${primitiveType} primitive to ${cubeStudioActive ? "Cube View" : "Desk Scene"}.`);
  }

  function duplicateObject() {
    if (!selectedObject) return;
    const duplicate: SceneObjectInstance = {
      ...structuredClone(selectedObject),
      id: uniqueId(selectedObject.assetId || "object"),
      name: `${selectedObject.name} copy`,
      transform: {
        ...selectedObject.transform,
        position: [
          selectedObject.transform.position[0] + 0.35,
          selectedObject.transform.position[1],
          selectedObject.transform.position[2],
        ],
      },
    };
    if (cubeStudioActive) {
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          objects: [...(current.cubeStudio?.objects ?? []), duplicate],
        },
      }));
    } else {
      onConfigurationChange((current) => ({
        ...current,
        objects: [...current.objects, duplicate],
      }));
    }
    onSelectedChange(duplicate.id);
    setMessage(`Duplicated ${selectedObject.name}.`);
  }

  function deleteTargetObject(targetId: string) {
    if (targetId === "room") return;
    const target = activeObjectsList.find((object) => object.id === targetId);
    const name = target?.name ?? targetId;
    if (onDeleteObject) {
      onDeleteObject(targetId);
    } else if (cubeStudioActive) {
      const remaining = (configuration.cubeStudio?.objects ?? []).filter(
        (object) => object.id !== targetId,
      );
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: current.cubeStudio
          ? { ...current.cubeStudio, objects: remaining }
          : undefined,
      }));
      if (selected === targetId || selectedObject?.id === targetId) {
        onSelectedChange(remaining[0]?.id ?? "");
      }
    } else {
      const remaining = configuration.objects.filter(
        (object) => object.id !== "room" && object.id !== targetId,
      );
      onConfigurationChange((current) => ({
        ...current,
        objects: current.objects.filter((object) => object.id !== targetId),
      }));
      if (selected === targetId || selectedObject?.id === targetId) {
        onSelectedChange(remaining[0]?.id ?? "");
      }
    }
    setMessage(`Deleted ${name}.`);
    showToast(`Deleted "${name}" from scene. Copy updated JSON in Config tab.`, "info");
  }

  function deleteObject() {
    if (!selectedObject) return;
    deleteTargetObject(selectedObject.id);
  }

  function addLight() {
    const light = newLight(lightTypeToAdd);
    if (cubeStudioActive) {
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          lights: [...(current.cubeStudio?.lights ?? []), light],
        },
      }));
    } else {
      onConfigurationChange((current) => ({ ...current, lights: [...current.lights, light] }));
    }
    setSelectedLight(light.id);
    setMessage(`Added ${light.name} to ${cubeStudioActive ? "Cube View" : "Desk Scene"}.`);
  }

  function duplicateLight() {
    if (!selectedLightItem) return;
    const light = { ...structuredClone(selectedLightItem), id: uniqueId(selectedLightItem.type), name: `${selectedLightItem.name} copy` };
    if (cubeStudioActive) {
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          lights: [...(current.cubeStudio?.lights ?? []), light],
        },
      }));
    } else {
      onConfigurationChange((current) => ({ ...current, lights: [...current.lights, light] }));
    }
    setSelectedLight(light.id);
    setMessage(`Duplicated ${selectedLightItem.name}.`);
  }

  function deleteLight() {
    if (!selectedLightItem) return;
    if (cubeStudioActive) {
      const remaining = (configuration.cubeStudio?.lights ?? []).filter(
        (light) => light.id !== selectedLightItem.id,
      );
      onConfigurationChange((current) => ({
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          lights: remaining,
        },
      }));
      setSelectedLight(remaining[0]?.id ?? "");
      setMessage(`Deleted ${selectedLightItem.name}.`);
      return;
    }
    const remaining = configuration.lights.filter((light) => light.id !== selectedLightItem.id);
    onConfigurationChange((current) => ({
      ...current,
      lights: current.lights.filter((light) => light.id !== selectedLightItem.id),
    }));
    setSelectedLight(remaining[0]?.id ?? "");
    setMessage(`Deleted ${selectedLightItem.name}.`);
  }

  function setEnvironment(update: (environment: SceneEnvironment) => SceneEnvironment) {
    onConfigurationChange((current) => ({
      ...current,
      environment: update(current.environment),
    }));
  }

  function exportFile() {
    const content = serializeSceneConfiguration(configuration);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${configuration.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Scene configuration downloaded.");
    showToast("Configuration JSON file downloaded!", "success");
  }

  async function copyConfiguration() {
    try {
      await navigator.clipboard.writeText(serializeSceneConfiguration(configuration));
      setMessage("Complete scene configuration copied.");
      showToast("Configuration JSON copied to clipboard!", "success");
    } catch (error) {
      const errMsg = `Could not copy configuration: ${error instanceof Error ? error.message : String(error)}`;
      setMessage(errMsg);
      showToast(errMsg, "error");
    }
  }

  function importConfiguration(source: string) {
    try {
      const imported = parseSceneConfiguration(source);
      onConfigurationChange(() => imported);
      onSelectedChange(imported.objects.find((object) => object.id !== "room")?.id ?? "");
      setImportText("");
      setMessage("Scene configuration imported and validated.");
      showToast("Scene configuration imported successfully!", "success");
    } catch (error) {
      const errMsg = `Import failed: ${error instanceof Error ? error.message : String(error)}`;
      setMessage(errMsg);
      showToast(errMsg, "error");
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      importConfiguration(await file.text());
    } catch (error) {
      const errMsg = `Could not read configuration file: ${error instanceof Error ? error.message : String(error)}`;
      setMessage(errMsg);
      showToast(errMsg, "error");
    } finally {
      event.target.value = "";
    }
  }

  function savePreset() {
    const name = presetName.trim();
    if (!name) {
      setMessage("Enter a name for this preset.");
      showToast("Enter a name for this preset.", "error");
      return;
    }
    try {
      const next = { ...presets, [name]: structuredClone(configuration) };
      localStorage.setItem(presetsKey, JSON.stringify(next));
      setPresets(next);
      setSelectedPreset(name);
      setPresetName("");
      setMessage(`Saved preset "${name}".`);
      showToast(`Preset "${name}" saved!`, "success");
    } catch (error) {
      setMessage(`Could not save preset: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function loadPreset() {
    const preset = presets[selectedPreset];
    if (!preset) {
      setMessage("Choose a saved preset first.");
      return;
    }
    onConfigurationChange(() => structuredClone(preset));
    onSelectedChange(preset.objects.find((object) => object.id !== "room")?.id ?? "");
    setMessage(`Loaded preset "${selectedPreset}".`);
  }

  function updateCameraProgress(value: string) {
    const number = Number(value);
    const stop = configuration.cameraStops[selectedCamera];
    if (!Number.isFinite(number) || !stop) return;
    const previousProgress = configuration.cameraStops[selectedCamera - 1]?.progress ?? -0.001;
    const nextProgress = configuration.cameraStops[selectedCamera + 1]?.progress ?? 1.001;
    const progress = Math.max(
      previousProgress + 0.001,
      Math.min(nextProgress - 0.001, number),
    );
    const nextStops = configuration.cameraStops.map((item, index) =>
      index === selectedCamera ? { ...item, progress } : item,
    );
    onConfigurationChange((current) => ({ ...current, cameraStops: nextStops }));
  }

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "objects", label: "Objects" },
    { id: "lights", label: "Lights" },
    { id: "environment", label: "Environment" },
    { id: "camera", label: "Camera" },
    { id: "configuration", label: "Config" },
  ];

  const editor = (
    <div
      className={`${
        expanded
          ? "fixed inset-0 z-[80] pointer-events-none"
          : `fixed bottom-4 right-[5.25rem] z-40 transition-all duration-300 ${
              isStageVisible || open
                ? "opacity-100 pointer-events-auto translate-y-0"
                : "opacity-0 pointer-events-none translate-y-3"
            }`
      } font-label-code-sm text-label-code-sm text-on-surface`}
    >
      {showOrientationWarning && (
        <div className="pointer-events-auto mb-2 flex max-w-xs items-center gap-2 rounded-xl border-2 border-primary bg-surface-container-lowest/95 p-3 text-xs text-on-surface shadow-[4px_4px_0px_#080d22] backdrop-blur-md animate-bounce">
          <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">
            screen_rotation
          </span>
          <div className="flex-1">
            <p className="font-bold text-primary">Horizontal Mode Required</p>
            <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
              Please rotate your phone horizontally to access the 3D scene editor panel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOrientationWarning(false)}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
      {!expanded && (
        <div className="pointer-events-auto ml-auto flex w-fit gap-1 pr-0">
          <button
            aria-expanded={open}
            className={`${buttonClass} flex h-10 items-center gap-2 shadow-[2px_2px_0px_#080d22]`}
            onClick={handleEditClick}
            type="button"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {open ? "close" : "tune"}
            </span>
            {open ? "Close scene editor" : "Edit scene"}
          </button>
        </div>
      )}

      {open && (
        <div
          className={`pointer-events-auto fixed z-50 right-2 sm:right-4 ${
            expanded
              ? "top-3 sm:top-4 bottom-3 sm:bottom-4 max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)]"
              : "top-3 sm:top-auto sm:bottom-16 bottom-3 max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-5.5rem)]"
          } ${panelClass} flex flex-col shadow-[6px_6px_0px_#080d22] overflow-hidden`}
          style={{
            width: `min(${panelWidth}px, calc(100vw - 1rem))`,
            transform: `translate(${panelPosition.x}px, ${panelPosition.y}px)`,
          }}
        >
          {/* Left-edge resize handle */}
          <div
            aria-label="Resize panel width"
            role="separator"
            onPointerDown={startWidthResize}
            onPointerMove={moveWidthResize}
            onPointerUp={endWidthResize}
            onPointerCancel={endWidthResize}
            className="absolute left-0 top-0 bottom-0 w-3.5 -translate-x-2 cursor-ew-resize flex items-center justify-center group touch-none select-none z-50 hover:bg-primary/20 transition-colors"
            title="Drag left/right to adjust editor panel width"
          >
            <div className="w-1.5 h-14 rounded-full bg-outline-variant/70 group-hover:bg-primary group-hover:w-2 group-active:bg-primary transition-all shadow-md flex flex-col justify-center items-center gap-0.5">
              <span className="w-0.5 h-1 bg-surface-container-lowest rounded-full" />
              <span className="w-0.5 h-1 bg-surface-container-lowest rounded-full" />
              <span className="w-0.5 h-1 bg-surface-container-lowest rounded-full" />
            </div>
          </div>

          {/* Sticky Panel Header */}
          <div
            className="mb-2 flex cursor-move touch-none flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-2.5 shrink-0"
            onPointerDown={startPanelDrag}
            onPointerMove={movePanelDrag}
            onPointerUp={endPanelDrag}
            onPointerCancel={endPanelDrag}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-primary text-base select-none shrink-0" title="Drag to reposition panel">
                drag_indicator
              </span>
              <label className="flex items-center gap-1.5 font-bold text-xs truncate cursor-pointer">
                <input
                  checked={configuration.enabled}
                  onChange={(event) =>
                    onConfigurationChange((current) => ({
                      ...current,
                      enabled: event.target.checked,
                    }))
                  }
                  type="checkbox"
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="truncate">Use Custom Config</span>
              </label>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Width Presets (Compact, Medium, Wide) */}
              <div className="hidden sm:flex items-center rounded border border-outline-variant/70 bg-surface-container-low p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setPanelWidth(360);
                    try { localStorage.setItem("malay-scene-editor-width", "360"); } catch {}
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${panelWidth <= 380 ? "bg-primary text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                  title="Compact width (360px)"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPanelWidth(460);
                    try { localStorage.setItem("malay-scene-editor-width", "460"); } catch {}
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${panelWidth > 380 && panelWidth <= 520 ? "bg-primary text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                  title="Comfortable width (460px)"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPanelWidth(620);
                    try { localStorage.setItem("malay-scene-editor-width", "620"); } catch {}
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${panelWidth > 520 ? "bg-primary text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                  title="Wide width (620px)"
                >
                  L
                </button>
              </div>

              {(panelPosition.x !== 0 || panelPosition.y !== 0) && (
                <button
                  type="button"
                  onClick={() => setPanelPosition({ x: 0, y: 0 })}
                  className={`${buttonClass} text-[11px] px-1.5 py-1 text-primary`}
                  title="Snap back to default dock"
                >
                  <span className="material-symbols-outlined text-xs align-middle">dock_to_right</span>
                </button>
              )}
              <button aria-label="Undo scene change" className={`${buttonClass} text-xs px-2 py-1`} disabled={!canUndo} onClick={onUndo} type="button">
                Undo
              </button>
              <button aria-label="Redo scene change" className={`${buttonClass} text-xs px-2 py-1`} disabled={!canRedo} onClick={onRedo} type="button">
                Redo
              </button>
              <button className={`${buttonClass} text-xs px-2 py-1`} onClick={onResetAll} type="button">
                Reset
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                title="Close scene editor"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1.5 scrollbar-thin">

          <label className="mb-3 block">
            <span className="mb-1 block">Scene name</span>
            <input
              className={inputClass}
              onBlur={() =>
                setNameDrafts((current) => {
                  const next = { ...current };
                  delete next.scene;
                  return next;
                })
              }
              onChange={(event) => {
                setNameDrafts((current) => ({ ...current, scene: event.target.value }));
                if (event.target.value.trim()) {
                  onConfigurationChange((current) => ({ ...current, name: event.target.value }));
                }
              }}
              value={nameDrafts.scene ?? configuration.name}
            />
          </label>

          {/* Active Scene Context & Navigation Toggle */}
          <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-outline-variant bg-surface-container-low p-2.5 shadow-[2px_2px_0px_#080d22]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">
                {cubeStudioActive ? "view_in_ar" : "desktop_windows"}
              </span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Editing: {cubeStudioActive ? "Cube Studio View" : "Desk View Scene"}
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  {cubeStudioActive
                    ? "Objects & lights tabs edit elements in the Cube View"
                    : "Objects & lights tabs edit elements in the Desk Scene"}
                </span>
              </div>
            </div>
            {onToggleCubeStudio && (
              <button
                type="button"
                onClick={handleToggleScene}
                className={`${buttonClass} font-bold text-xs flex items-center gap-1.5 ${
                  cubeStudioActive
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-high text-on-surface hover:border-primary"
                }`}
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  {cubeStudioActive ? "desktop_windows" : "view_in_ar"}
                </span>
                {cubeStudioActive ? "Exit to Desk View" : "Preview Cube View"}
              </button>
            )}
          </div>

          {selectedObject && selectedObject.id !== "room" && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-2.5 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-lg shrink-0" aria-hidden="true">view_in_ar</span>
                <div className="min-w-0 truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface truncate">{selectedObject.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">
                      {selectedObject.assetId}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">
                    {cubeStudioActive ? "Cube Studio Object" : "Desk Scene Object"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {tab !== "objects" && (
                  <button
                    type="button"
                    onClick={() => setTab("objects")}
                    className="text-xs px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold border border-outline-variant transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteTargetObject(selectedObject.id)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg text-error bg-error/10 hover:bg-error/20 border border-error/30 font-bold transition-colors"
                  title={`Delete ${selectedObject.name} from scene`}
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                  Delete object
                </button>
              </div>
            </div>
          )}

          <div aria-label="Editor panels" className="mb-3 flex flex-wrap gap-1 shrink-0">
            {tabs.map(({ id, label }) => (
              <button
                aria-pressed={tab === id}
                className={`flex-1 min-w-[56px] rounded-lg border px-2 py-1.5 text-center font-label-code-sm text-xs transition-colors cursor-pointer truncate ${
                  tab === id
                    ? "border-primary bg-primary-container font-bold text-on-primary-container shadow-[2px_2px_0px_#080d22]"
                    : "border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                }`}
                key={id}
                onClick={() => setTab(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "objects" && (
            <section aria-label="Scene objects">
              <input
                aria-label="Search scene objects"
                className={`${inputClass} mb-2`}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search objects"
                value={search}
              />
              <div className="mb-2">
                <div className="mb-1 flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">view_in_ar</span>
                    Selected object
                  </span>
                  {selectedObject && selectedObject.id !== "room" && (
                    <button
                      type="button"
                      onClick={() => deleteTargetObject(selectedObject.id)}
                      className="text-xs font-semibold text-error hover:text-error/80 flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                      Delete object
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Selected scene object"
                    className={`${inputClass} flex-1`}
                    onChange={(event) => onSelectedChange(event.target.value)}
                    value={selectedObject?.id ?? ""}
                  >
                    <option value="">Select object</option>
                    {activeObjectsList
                      .filter((object) => object.id !== "room")
                      .map((object) => (
                        <option key={object.id} value={object.id}>
                          {object.name}
                        </option>
                      ))}
                    {activeObjectsList.filter((object) => object.id !== "room").length === 0 && (
                      <option value="">(No objects in this view)</option>
                    )}
                  </select>
                  {selectedObject && selectedObject.id !== "room" && (
                    <button
                      type="button"
                      onClick={() => deleteTargetObject(selectedObject.id)}
                      className="px-3 py-2 text-xs font-bold rounded-lg text-error bg-error/10 hover:bg-error/20 border border-error/40 flex items-center gap-1 transition-colors shrink-0"
                      title={`Delete ${selectedObject.name} from scene`}
                    >
                      <span className="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {activeObjectsList.filter((object) => object.id !== "room").length === 0 && (
                <div className="mb-3 rounded-lg border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-2xl block mb-1 text-primary" aria-hidden="true">view_in_ar</span>
                  <p className="font-bold">No custom objects in {cubeStudioActive ? "Cube View" : "Desk Scene"}</p>
                  <p className="mt-1">Add objects using the model or primitive controls below.</p>
                </div>
              )}
              <ul className="mb-3 max-h-32 space-y-1 overflow-auto">
                {filteredObjects.map((object) => (
                  <li className="flex items-center gap-2" key={object.id}>
                    <button
                      aria-pressed={selectedObject?.id === object.id}
                      className={`min-w-0 flex-1 truncate text-left ${buttonClass} ${selected === object.id ? "border-primary" : ""}`}
                      onClick={() => onSelectedChange(object.id)}
                      type="button"
                    >
                      {object.name} <span className="text-on-surface-variant">· {object.assetId}</span>
                    </button>
                    <label className="flex items-center gap-1" title="Enable object">
                      <input
                        aria-label={`Enable ${object.name}`}
                        checked={object.enabled}
                        onChange={(event) =>
                          updateObject(object.id, (current) => ({
                            ...current,
                            enabled: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      on
                    </label>
                    <label className="flex items-center gap-1" title="Show object">
                      <input
                        aria-label={`Show ${object.name}`}
                        checked={object.visible}
                        onChange={(event) =>
                          updateObject(object.id, (current) => ({
                            ...current,
                            visible: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      vis
                    </label>
                    {object.id !== "room" && (
                      <button
                        aria-label={`Delete ${object.name}`}
                        className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteTargetObject(object.id);
                        }}
                        title={`Delete ${object.name}`}
                        type="button"
                      >
                        <span className="material-symbols-outlined block text-base" aria-hidden="true">delete</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                <select
                  aria-label="Registered models"
                  className={inputClass}
                  onChange={(event) => setAssetToAdd(event.target.value)}
                  value={assetToAdd}
                >
                  <option value="">Choose registered model</option>
                  {assetRegistry
                    .filter((asset) =>
                      `${asset.displayName} ${asset.id} ${asset.format}`
                        .toLowerCase()
                        .includes(assetSearch.toLowerCase()),
                    )
                    .map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.displayName} · {asset.format.toUpperCase()}
                    </option>
                    ))}
                </select>
                <button className={buttonClass} onClick={addObject} type="button">
                  Add object
                </button>
              </div>

              <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                <label>
                  <span className="mb-1 block">Standard primitive</span>
                  <select
                    aria-label="Primitive geometry"
                    className={inputClass}
                    onChange={(event) => setPrimitiveType(event.target.value as ScenePrimitiveType)}
                    value={primitiveType}
                  >
                    <option value="box">Box</option>
                    <option value="sphere">Sphere</option>
                    <option value="cylinder">Cylinder</option>
                    <option value="plane">Plane</option>
                    <option value="cone">Cone</option>
                    <option value="torus">Torus</option>
                    <option value="capsule">Capsule</option>
                    <option value="circle">Circle</option>
                    <option value="ring">Ring</option>
                  </select>
                </label>
                <button className={`${buttonClass} self-end`} onClick={addPrimitive} type="button">
                  <span className="material-symbols-outlined mr-1 align-middle text-lg" aria-hidden="true">deployed_code</span>
                  Add primitive
                </button>
              </div>

              <label className="mb-2 block">
                <span className="mb-1 block">Find model</span>
                <input
                  aria-label="Search registered models"
                  className={inputClass}
                  onChange={(event) => setAssetSearch(event.target.value)}
                  placeholder="Filter asset dropdown"
                  value={assetSearch}
                />
              </label>

              {selectedObject ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button className={buttonClass} onClick={duplicateObject} type="button">
                      <span className="material-symbols-outlined text-sm mr-1 align-middle" aria-hidden="true">content_copy</span>
                      Duplicate
                    </button>
                    <button
                      className={`${buttonClass} border-error/40 text-error bg-error/10 hover:bg-error/20 font-bold`}
                      onClick={deleteObject}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm mr-1 align-middle" aria-hidden="true">delete</span>
                      Delete object
                    </button>
                    <button className={buttonClass} onClick={() => onResetSelected(selectedObject.id)} type="button">
                      <span className="material-symbols-outlined text-sm mr-1 align-middle" aria-hidden="true">restart_alt</span>
                      Reset transform
                    </button>
                  </div>
                  <label className="mb-2 block">
                    <span className="mb-1 block">Object name</span>
                    <input
                      className={inputClass}
                      onBlur={() =>
                        setNameDrafts((current) => {
                          const next = { ...current };
                          delete next[selectedObject.id];
                          return next;
                        })
                      }
                      onChange={(event) => {
                        setNameDrafts((current) => ({
                          ...current,
                          [selectedObject.id]: event.target.value,
                        }));
                        if (event.target.value.trim()) {
                          updateObject(selectedObject.id, (current) => ({
                            ...current,
                            name: event.target.value,
                          }));
                        }
                      }}
                      value={nameDrafts[selectedObject.id] ?? selectedObject.name}
                    />
                  </label>
                  <p className="mb-3 text-xs text-on-surface-variant">
                    Asset: {selectedAsset?.path ?? selectedObject.assetId}
                  </p>
                  <div className="mb-2 grid grid-cols-3 gap-1">
                    {(["translate", "rotate", "scale"] as const).map((nextMode) => (
                      <button
                        aria-pressed={mode === nextMode}
                        className={`${buttonClass} capitalize ${mode === nextMode ? "border-primary bg-primary-container text-on-primary-container" : ""}`}
                        key={nextMode}
                        onClick={() => onModeChange(nextMode)}
                        type="button"
                      >
                        {nextMode}
                      </button>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2">
                      Coordinate space
                      <select
                        className={inputClass}
                        onChange={(event) => onTransformSpaceChange(event.target.value as TransformSpace)}
                        value={transformSpace}
                      >
                        <option value="world">World</option>
                        <option value="local">Local</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        checked={snapEnabled}
                        onChange={(event) => onSnapEnabledChange(event.target.checked)}
                        type="checkbox"
                      />
                      Snap
                    </label>
                  </div>
                  <label className="mb-3 flex items-center gap-2">
                    <input
                      checked={selectedObject.castShadow}
                      onChange={(event) =>
                        updateObject(selectedObject.id, (current) => ({
                          ...current,
                          castShadow: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    Cast shadow
                    <input
                      aria-label="Receive shadow"
                      checked={selectedObject.receiveShadow}
                      onChange={(event) =>
                        updateObject(selectedObject.id, (current) => ({
                          ...current,
                          receiveShadow: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    Receive shadow
                  </label>
                  <TransformFields
                    transform={selectedObject.transform}
                    draftValues={draftValues}
                    selectedId={selectedObject.id}
                    onAxisChange={updateAxis}
                    onAxisBlur={(key) =>
                      setDraftValues((current) => {
                        const next = { ...current };
                        delete next[key];
                        return next;
                      })
                    }
                  />
                  <details className="mt-3 rounded-lg border-2 border-surface-variant bg-surface-container-lowest p-3" open>
                      <summary className="cursor-pointer select-none font-bold">
                        <span className="material-symbols-outlined mr-2 align-middle text-lg" aria-hidden="true">animation</span>
                        Animations
                      </summary>
                      <div className="mt-3 space-y-3">
                        <label className="flex items-center justify-between gap-3 rounded-lg border-2 border-outline-variant bg-surface-container-low p-2.5 cursor-pointer hover:bg-surface-container transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">
                              {selectedObject.continueAllAnimationsInLoop ? "sync" : "sync_disabled"}
                            </span>
                            <div>
                              <span className="font-bold text-sm block text-on-surface">Continue all animations in loop</span>
                              <span className="text-xs text-on-surface-variant block">Play included animations sequentially in a continuous loop</span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedObject.continueAllAnimationsInLoop ?? false}
                            onChange={(event) =>
                              updateObject(selectedObject.id, (object) => ({
                                ...object,
                                continueAllAnimationsInLoop: event.target.checked,
                              }))
                            }
                            className="h-5 w-5 rounded accent-primary cursor-pointer"
                          />
                        </label>

                        {selectedObject.continueAllAnimationsInLoop ? (
                          <div className="rounded-md border border-primary/40 bg-primary/10 p-2 text-xs text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">info</span>
                            <span>Playing in sequence order below. Use <strong>▲ Move Up</strong> / <strong>▼ Move Down</strong> to reorder. Uncheck <em>Play in sequence</em> to skip any animation.</span>
                          </div>
                        ) : (
                          <label className="flex items-center justify-between gap-2">
                            <span>Single active animation</span>
                            <select
                              className={inputClass}
                              value={selectedObject.defaultAnimationId ?? ""}
                              onChange={(event) =>
                                updateObject(selectedObject.id, (object) => {
                                  const value = event.target.value;
                                  if (value.startsWith("embedded:")) {
                                    const clipName = value.slice("embedded:".length);
                                    const existing = object.animations?.find(
                                      (animation) =>
                                        animation.type === "embedded" &&
                                        animation.clipName === clipName,
                                    );
                                    const id = existing?.id ?? `embedded-${uniqueId("clip")}`;
                                    return {
                                      ...object,
                                      animations: existing
                                        ? object.animations
                                        : [
                                            ...(object.animations ?? []),
                                            {
                                              id,
                                              name: clipName,
                                              type: "embedded",
                                              clipName,
                                              loop: true,
                                              timeScale: 1,
                                            },
                                          ],
                                      defaultAnimationId: id,
                                    };
                                  }
                                  return {
                                    ...object,
                                    defaultAnimationId: value || undefined,
                                  };
                                })
                              }
                            >
                              <option value="">None</option>
                              {(selectedObject.animations ?? []).map((animation) => (
                                <option key={animation.id} value={animation.id}>
                                  {animation.name}
                                </option>
                              ))}
                              {(embeddedAnimations[selectedObject.id] ?? [])
                                .filter(
                                  (clipName) =>
                                    !(selectedObject.animations ?? []).some(
                                      (animation) =>
                                        animation.type === "embedded" &&
                                        animation.clipName === clipName,
                                    ),
                                )
                                .map((clipName) => (
                                  <option key={`embedded-${clipName}`} value={`embedded:${clipName}`}>
                                    Embedded: {clipName}
                                  </option>
                                ))}
                            </select>
                          </label>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            className={buttonClass}
                            onClick={() =>
                              updateObject(selectedObject.id, (object) => {
                                const id = uniqueId("preset-animation");
                                const animation: SceneObjectAnimation = {
                                  id,
                                  name: "Pulse",
                                  type: "preset",
                                  preset: "pulse",
                                  loop: true,
                                  timeScale: 1,
                                  duration: 3,
                                  enabledInSequence: true,
                                };
                                return {
                                  ...object,
                                  animations: [...(object.animations ?? []), animation],
                                  defaultAnimationId: object.defaultAnimationId ?? id,
                                };
                              })
                            }
                            type="button"
                          >
                            <span className="material-symbols-outlined mr-1 align-middle text-lg" aria-hidden="true">add_circle</span>
                            Add preset
                          </button>
                          {(embeddedAnimations[selectedObject.id] ?? [])
                            .filter(
                              (clipName) =>
                                !(selectedObject.animations ?? []).some(
                                  (animation) =>
                                    animation.type === "embedded" &&
                                    animation.clipName === clipName,
                                ),
                            )
                            .map((clipName) => (
                              <button
                                className={buttonClass}
                                key={`add-${clipName}`}
                                onClick={() =>
                                  updateObject(selectedObject.id, (object) => {
                                    const id = `embedded-${uniqueId("clip")}`;
                                    const animation: SceneObjectAnimation = {
                                      id,
                                      name: clipName,
                                      type: "embedded",
                                      clipName,
                                      loop: true,
                                      timeScale: 1,
                                      enabledInSequence: true,
                                    };
                                    return {
                                      ...object,
                                      animations: [...(object.animations ?? []), animation],
                                      defaultAnimationId: id,
                                    };
                                  })
                                }
                                type="button"
                              >
                                Add {clipName}
                              </button>
                            ))}
                        </div>
                        {(selectedObject.animations ?? []).map((animation, index) => (
                          <div className="grid gap-2 rounded-lg border-2 border-outline-variant bg-surface-container-low p-2.5" key={animation.id}>
                            <div className="flex items-center justify-between gap-2 border-b border-outline-variant/40 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-mono text-xs font-bold text-primary">
                                  #{index + 1}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                  {animation.type === "embedded" ? "Extracted Clip" : "Custom Preset"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className={`${buttonClass} px-1.5 py-0.5 text-xs flex items-center disabled:opacity-30 disabled:cursor-not-allowed`}
                                  disabled={index === 0}
                                  onClick={() => {
                                    updateObject(selectedObject.id, (object) => {
                                      const list = [...(object.animations ?? [])];
                                      if (index <= 0) return object;
                                      const temp = list[index];
                                      list[index] = list[index - 1];
                                      list[index - 1] = temp;
                                      return { ...object, animations: list };
                                    });
                                  }}
                                  title="Move up in sequence"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_upward</span>
                                </button>
                                <button
                                  className={`${buttonClass} px-1.5 py-0.5 text-xs flex items-center disabled:opacity-30 disabled:cursor-not-allowed`}
                                  disabled={index === (selectedObject.animations ?? []).length - 1}
                                  onClick={() => {
                                    updateObject(selectedObject.id, (object) => {
                                      const list = [...(object.animations ?? [])];
                                      if (index >= list.length - 1) return object;
                                      const temp = list[index];
                                      list[index] = list[index + 1];
                                      list[index + 1] = temp;
                                      return { ...object, animations: list };
                                    });
                                  }}
                                  title="Move down in sequence"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_downward</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <label>Name<input className={inputClass} value={animation.name} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} /></label>
                              <label>Type<select className={inputClass} value={animation.type} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as "embedded" | "preset", preset: event.target.value === "preset" ? "pulse" : undefined, clipName: event.target.value === "embedded" ? (item.clipName ?? "") : undefined } : item) }))}><option value="preset">Custom preset</option><option value="embedded">Embedded clip</option></select></label>
                            </div>
                            {animation.type === "preset" ? (
                              <label>
                                Preset
                                <select
                                  className={inputClass}
                                  value={animation.preset ?? "pulse"}
                                  onChange={(event) =>
                                    updateObject(selectedObject.id, (object) => ({
                                      ...object,
                                      animations: (object.animations ?? []).map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              preset: event.target.value as SceneObjectPresetAnimation,
                                              name:
                                                PRESET_ANIMATION_OPTIONS.find(
                                                  (o) => o.id === event.target.value,
                                                )?.label ?? item.name,
                                            }
                                          : item,
                                      ),
                                    }))
                                  }
                                >
                                  {PRESET_ANIMATION_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : (
                              <label>Embedded clip<select className={inputClass} value={animation.clipName ?? ""} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, clipName: event.target.value, name: item.name === item.clipName || !item.name ? event.target.value : item.name } : item), defaultAnimationId: object.defaultAnimationId ?? animation.id }))}><option value="">Choose clip</option>{(embeddedAnimations[selectedObject.id] ?? []).map((clipName) => <option key={clipName} value={clipName}>{clipName}</option>)}</select></label>
                            )}
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label>Speed<input className={inputClass} min={0.1} step={0.1} type="number" value={animation.timeScale} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, timeScale: Number(event.target.value) } : item) }))} /></label>
                              <label>
                                Duration (s)
                                <input
                                  className={inputClass}
                                  min={0.5}
                                  step={0.5}
                                  placeholder={animation.type === "embedded" ? "Auto" : "3"}
                                  type="number"
                                  value={animation.duration ?? ""}
                                  onChange={(event) =>
                                    updateObject(selectedObject.id, (object) => ({
                                      ...object,
                                      animations: (object.animations ?? []).map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              duration: event.target.value ? Number(event.target.value) : undefined,
                                            }
                                          : item,
                                      ),
                                    }))
                                  }
                                />
                              </label>
                              <label className="flex items-center gap-2 pt-5 cursor-pointer">
                                <input
                                  checked={animation.loop}
                                  type="checkbox"
                                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                                  onChange={(event) =>
                                    updateObject(selectedObject.id, (object) => ({
                                      ...object,
                                      animations: (object.animations ?? []).map((item, itemIndex) =>
                                        itemIndex === index ? { ...item, loop: event.target.checked } : item,
                                      ),
                                    }))
                                  }
                                />
                                <span className="text-xs">Loop clip</span>
                              </label>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                <input
                                  type="checkbox"
                                  checked={animation.enabledInSequence !== false}
                                  onChange={(event) =>
                                    updateObject(selectedObject.id, (object) => ({
                                      ...object,
                                      animations: (object.animations ?? []).map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, enabledInSequence: event.target.checked }
                                          : item,
                                      ),
                                    }))
                                  }
                                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                                />
                                <span className={animation.enabledInSequence === false ? "text-on-surface-variant line-through" : "text-on-surface"}>
                                  Play in sequence
                                </span>
                              </label>

                              <div className="flex items-center gap-1.5">
                                {!selectedObject.continueAllAnimationsInLoop && (
                                  <button
                                    className={`${buttonClass} flex items-center gap-1 text-xs ${
                                      selectedObject.defaultAnimationId === animation.id
                                        ? "border-primary bg-primary/20 font-bold text-primary"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      updateObject(selectedObject.id, (object) => ({
                                        ...object,
                                        defaultAnimationId:
                                          object.defaultAnimationId === animation.id
                                            ? undefined
                                            : animation.id,
                                      }))
                                    }
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                                      {selectedObject.defaultAnimationId === animation.id
                                        ? "check_circle"
                                        : "play_arrow"}
                                    </span>
                                    {selectedObject.defaultAnimationId === animation.id
                                      ? "Active (Single)"
                                      : "Set Single"}
                                  </button>
                                )}
                                <button
                                  className={`${buttonClass} text-xs text-error hover:bg-error/10`}
                                  onClick={() =>
                                    updateObject(selectedObject.id, (object) => ({
                                      ...object,
                                      animations: (object.animations ?? []).filter(
                                        (_, itemIndex) => itemIndex !== index,
                                      ),
                                      defaultAnimationId:
                                        object.defaultAnimationId === animation.id
                                          ? undefined
                                          : object.defaultAnimationId,
                                    }))
                                  }
                                  type="button"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(selectedObject.animations ?? []).length === 0 && (
                          <p className="rounded-md border border-dashed border-outline-variant p-3 text-on-surface-variant">No animations configured.</p>
                        )}
                      </div>
                    </details>
                    {selectedObject.geometry && (
                    <details className="mt-3 rounded-lg border-2 border-surface-variant bg-surface-container-lowest p-3" open>
                      <summary className="cursor-pointer select-none font-bold">
                        <span className="material-symbols-outlined mr-2 align-middle text-lg" aria-hidden="true">deployed_code</span>
                        Geometry
                      </summary>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(selectedObject.geometry.parameters).map(([parameter, value]) => (
                          <label key={parameter}>
                            <span className="mb-1 block capitalize">{parameter}</span>
                            <input
                              className={inputClass}
                              min={parameter.toLowerCase().includes("segments") ? 3 : undefined}
                              step={parameter.toLowerCase().includes("segments") ? 1 : 0.05}
                              type="number"
                              value={value}
                              onChange={(event) =>
                                updateObject(selectedObject.id, (object) => ({
                                  ...object,
                                  geometry: object.geometry
                                    ? {
                                        ...object.geometry,
                                        parameters: {
                                          ...object.geometry.parameters,
                                          [parameter]: Number(event.target.value),
                                        },
                                      }
                                    : undefined,
                                }))
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </details>
                  )}
                  <details className="mt-3 rounded-lg border-2 border-surface-variant bg-surface-container-lowest p-3" open>
                    <summary className="cursor-pointer select-none font-bold">
                      <span className="material-symbols-outlined mr-2 align-middle text-lg" aria-hidden="true">palette</span>
                      Material and light
                    </summary>
                    {selectedObject.material ? (
                      <div className="mt-3 grid gap-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
                          <input
                            checked={selectedObject.material.preserveTextureAndColor ?? false}
                            onChange={(event) =>
                              updateObject(selectedObject.id, (object) => ({
                                ...object,
                                material: object.material
                                  ? {
                                      ...object.material,
                                      preserveTextureAndColor: event.target.checked,
                                    }
                                  : undefined,
                              }))
                            }
                            type="checkbox"
                          />
                          Preserve current texture and color of the object
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          <label>Base color<input className={inputClass} type="color" value={selectedObject.material.color} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, color: event.target.value } : undefined }))} /></label>
                          <label>Emissive<input className={inputClass} type="color" value={selectedObject.material.emissive} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, emissive: event.target.value } : undefined }))} /></label>
                          <label>Side<select className={inputClass} value={selectedObject.material.side} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, side: event.target.value as "front" | "back" | "double" } : undefined }))}><option value="front">Front</option><option value="back">Back</option><option value="double">Double</option></select></label>
                        </div>
                        <label>Roughness<input className={inputClass} max={1} min={0} step={0.05} type="range" value={selectedObject.material.roughness} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, roughness: Number(event.target.value) } : undefined }))} /></label>
                        <label>Metalness<input className={inputClass} max={1} min={0} step={0.05} type="range" value={selectedObject.material.metalness} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, metalness: Number(event.target.value) } : undefined }))} /></label>
                        <label>Emissive intensity<input className={inputClass} min={0} step={0.1} type="number" value={selectedObject.material.emissiveIntensity} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, emissiveIntensity: Number(event.target.value) } : undefined }))} /></label>
                        <label>Opacity<input className={inputClass} max={1} min={0} step={0.05} type="range" value={selectedObject.material.opacity} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, opacity: Number(event.target.value), transparent: Number(event.target.value) < 1 } : undefined }))} /></label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2"><input checked={selectedObject.material.transparent} type="checkbox" onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, transparent: event.target.checked } : undefined }))} />Transparent</label>
                          <label className="flex items-center gap-2"><input checked={selectedObject.material.wireframe} type="checkbox" onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, material: object.material ? { ...object.material, wireframe: event.target.checked } : undefined }))} />Wireframe</label>
                        </div>

                        {/* Self-illuminated glow without emitting light onto surroundings */}
                        <div className="rounded-lg border border-primary/40 bg-surface-container-low p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 font-bold text-on-surface cursor-pointer">
                              <input
                                checked={selectedObject.material.selfGlow ?? false}
                                type="checkbox"
                                onChange={(event) => {
                                  const checked = event.target.checked;
                                  updateObject(selectedObject.id, (object) => ({
                                    ...object,
                                    material: object.material
                                      ? {
                                          ...object.material,
                                          selfGlow: checked,
                                          emissive:
                                            checked && (!object.material.emissive || object.material.emissive === "#000000")
                                              ? "#ffffff"
                                              : object.material.emissive,
                                          emissiveIntensity:
                                            checked && (!object.material.emissiveIntensity || object.material.emissiveIntensity === 0)
                                              ? 1.5
                                              : object.material.emissiveIntensity,
                                          preserveTextureAndColor: true,
                                          emissiveMapFromBase: object.material.emissiveMapFromBase ?? true,
                                        }
                                      : undefined,
                                  }));
                                }}
                              />
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">light_mode</span>
                                Self-illuminated glow
                              </span>
                            </label>
                            <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider bg-surface-container-high px-1.5 py-0.5 rounded">
                              No scene light
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Intensifies object color to glow natively without casting actual light onto surrounding objects.
                          </p>
                          {selectedObject.material.selfGlow && (
                            <div className="grid gap-2 pt-1 border-t border-outline-variant/50">
                              <div className="grid grid-cols-2 gap-2">
                                <label className="text-xs">
                                  Glow color
                                  <input
                                    className={inputClass}
                                    type="color"
                                    value={
                                      selectedObject.material.emissive && selectedObject.material.emissive !== "#000000"
                                        ? selectedObject.material.emissive
                                        : "#ffffff"
                                    }
                                    onChange={(event) =>
                                      updateObject(selectedObject.id, (object) => ({
                                        ...object,
                                        material: object.material ? { ...object.material, emissive: event.target.value } : undefined,
                                      }))
                                    }
                                  />
                                </label>
                                <label className="text-xs">
                                  Glow intensity
                                  <input
                                    className={inputClass}
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    type="number"
                                    value={selectedObject.material.emissiveIntensity || 1.5}
                                    onChange={(event) =>
                                      updateObject(selectedObject.id, (object) => ({
                                        ...object,
                                        material: object.material
                                          ? { ...object.material, emissiveIntensity: Number(event.target.value) }
                                          : undefined,
                                      }))
                                    }
                                  />
                                </label>
                              </div>
                              <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                                <input
                                  checked={selectedObject.material.emissiveMapFromBase ?? true}
                                  type="checkbox"
                                  onChange={(event) =>
                                    updateObject(selectedObject.id, (object) => ({
                                      ...object,
                                      material: object.material
                                        ? { ...object.material, emissiveMapFromBase: event.target.checked }
                                        : undefined,
                                    }))
                                  }
                                />
                                Glow texture details (maps base texture to emissive to preserve surface details)
                              </label>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-outline-variant pt-3">
                          <label className="flex items-center gap-2">
                            <input
                              checked={selectedObject.glow?.enabled ?? false}
                              type="checkbox"
                              onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: { enabled: event.target.checked, color: object.glow?.color ?? "#ffffff", intensity: object.glow?.intensity ?? 1, offsetY: object.glow?.offsetY ?? 0 } }))}
                            />
                            Emit light
                          </label>
                          {selectedObject.glow?.enabled && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <label>Glow color<input className={inputClass} type="color" value={selectedObject.glow.color} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: object.glow ? { ...object.glow, color: event.target.value } : undefined }))} /></label>
                              <label>Light intensity<input className={inputClass} min={0} step={0.1} type="number" value={selectedObject.glow.intensity} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: object.glow ? { ...object.glow, intensity: Number(event.target.value) } : undefined }))} /></label>
                              <label>Light position (Y-axis)<input className={inputClass} step={0.05} type="number" value={selectedObject.glow.offsetY ?? 0} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: object.glow ? { ...object.glow, offsetY: Number(event.target.value) } : undefined }))} /></label>
                            </div>
                          )}
                        </div>
                        <div className="border-t border-outline-variant pt-2">
                          <button
                            className={`${buttonClass} text-xs`}
                            onClick={() =>
                              updateObject(selectedObject.id, (object) => {
                                const next = { ...object };
                                delete next.material;
                                return next;
                              })
                            }
                            type="button"
                          >
                            Remove material controls
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <label className="flex items-center gap-2 text-sm text-on-surface">
                          <input
                            checked={preserveTextureOption}
                            onChange={(event) => setPreserveTextureOption(event.target.checked)}
                            type="checkbox"
                          />
                          Preserve current texture and color of the object
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={buttonClass}
                            onClick={() => updateObject(selectedObject.id, (object) => ({
                              ...object,
                              material: {
                                color: "#ffffff",
                                roughness: 0.65,
                                metalness: 0,
                                emissive: "#000000",
                                emissiveIntensity: 0,
                                transparent: false,
                                opacity: 1,
                                wireframe: false,
                                side: "front",
                                preserveTextureAndColor: preserveTextureOption,
                              },
                              glow: { enabled: false, color: "#ffffff", intensity: 0, offsetY: 0 },
                            }))}
                            type="button"
                          >
                            Add material controls
                          </button>
                          <button
                            className={`${buttonClass} border-primary/40 font-bold text-primary`}
                            onClick={() => updateObject(selectedObject.id, (object) => ({
                              ...object,
                              material: {
                                color: "#ffffff",
                                roughness: 0.65,
                                metalness: 0,
                                emissive: "#ffffff",
                                emissiveIntensity: 1.5,
                                transparent: false,
                                opacity: 1,
                                wireframe: false,
                                side: "front",
                                preserveTextureAndColor: true,
                                selfGlow: true,
                                emissiveMapFromBase: true,
                              },
                              glow: { enabled: false, color: "#ffffff", intensity: 0, offsetY: 0 },
                            }))}
                            type="button"
                          >
                            Enable self-illuminated glow
                          </button>
                        </div>
                      </div>
                    )}
                  </details>
                  <details className="mt-3 rounded-lg border-2 border-surface-variant bg-surface-container-lowest p-3" open>
                    <summary className="cursor-pointer select-none font-bold text-on-surface">
                      <span className="material-symbols-outlined mr-2 align-middle text-lg">ads_click</span>
                      Interactions
                    </summary>
                    {selectedObject.interactions ? (
                      <div className="mt-3 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              checked={selectedObject.interactions.enabled}
                              onChange={(event) =>
                                updateSelectedInteractions((interactions) => ({
                                  ...interactions,
                                  enabled: event.target.checked,
                                }))
                              }
                              type="checkbox"
                            />
                            Enable interactions
                          </label>
                          <label className="flex items-center gap-2">
                            Trigger
                            <select
                              className={inputClass}
                              onChange={(event) =>
                                updateSelectedInteractions((interactions) => ({
                                  ...interactions,
                                  trigger: event.target.value as "click",
                                }))
                              }
                              value={selectedObject.interactions.trigger}
                            >
                              <option value="click">Click</option>
                            </select>
                          </label>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <select
                            aria-label="Interaction action type"
                            className={inputClass}
                            onChange={(event) =>
                              setActionTypeToAdd(event.target.value as SceneInteractionAction["type"])
                            }
                            value={actionTypeToAdd}
                          >
                            <option value="playAudio">Play audio</option>
                            <option value="stopAudio">Stop audio</option>
                            <option value="playAnimation">Play animation</option>
                            <option value="openModal">Open modal</option>
                            <option value="openUrl">Open URL</option>
                            <option value="showInformation">Show information</option>
                            <option value="focusObject">Focus object</option>
                            <option value="enterCubeView">Enter Cube View</option>
                            <option value="customAction">Custom action</option>
                          </select>
                          <button
                            className={buttonClass}
                            onClick={() =>
                              updateSelectedInteractions((interactions) => ({
                                ...interactions,
                                actions: [...interactions.actions, newInteractionAction(actionTypeToAdd)],
                              }))
                            }
                            type="button"
                          >
                            Add action
                          </button>
                        </div>
                        {selectedObject.interactions.actions.length === 0 ? (
                          <p className="rounded-md border border-dashed border-outline-variant p-3 text-on-surface-variant">
                            No actions configured. Add an action to make this object interactive.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {selectedObject.interactions.actions.map((action, index) => (
                              <InteractionActionFields
                                action={action}
                                count={selectedObject.interactions?.actions.length ?? 0}
                                index={index}
                                key={`${action.type}-${index}`}
                                onChange={(nextAction) =>
                                  updateSelectedInteractions((interactions) => ({
                                    ...interactions,
                                    actions: interactions.actions.map((item, itemIndex) =>
                                      itemIndex === index ? nextAction : item,
                                    ),
                                  }))
                                }
                                onMove={(direction) =>
                                  updateSelectedInteractions((interactions) => {
                                    const nextIndex = index + direction;
                                    if (nextIndex < 0 || nextIndex >= interactions.actions.length) return interactions;
                                    const actions = [...interactions.actions];
                                    [actions[index], actions[nextIndex]] = [actions[nextIndex], actions[index]];
                                    return { ...interactions, actions };
                                  })
                                }
                                onDuplicate={() =>
                                  updateSelectedInteractions((interactions) => ({
                                    ...interactions,
                                    actions: [
                                      ...interactions.actions.slice(0, index + 1),
                                      structuredClone(action),
                                      ...interactions.actions.slice(index + 1),
                                    ],
                                  }))
                                }
                                onRemove={() =>
                                  updateSelectedInteractions((interactions) => ({
                                    ...interactions,
                                    actions: interactions.actions.filter((_, itemIndex) => itemIndex !== index),
                                  }))
                                }
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={buttonClass}
                            onClick={() => updateSelectedInteractions(() => ({
                              enabled: false,
                              trigger: "click",
                              actions: [],
                            }))}
                            type="button"
                          >
                            Reset interactions
                          </button>
                          <button
                            className={buttonClass}
                            onClick={() =>
                              setMessage(
                                selectedObject.interactions?.actions.length
                                  ? "Preview: safe actions can be tested by clicking the object in presentation mode."
                                  : "Add an action before previewing.",
                              )
                            }
                            type="button"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`${buttonClass} mt-3`}
                        onClick={() =>
                          updateSelectedInteractions(() => ({
                            enabled: false,
                            trigger: "click",
                            actions: [],
                          }))
                        }
                        type="button"
                      >
                        Add interaction settings
                      </button>
                    )}
                  </details>
                </>
              ) : (
                <p className="text-sm text-on-surface-variant">No object selected.</p>
              )}
            </section>
          )}

          {tab === "lights" && (
            <section aria-label="Scene lights">
              <input
                aria-label="Search scene lights"
                className={`${inputClass} mb-2`}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search lights"
                value={search}
              />
              <ul className="mb-3 max-h-28 space-y-1 overflow-auto">
                {filteredLights.map((light) => (
                  <li className="flex items-center gap-2" key={light.id}>
                    <button
                      aria-pressed={selectedLightItem?.id === light.id}
                      className={`min-w-0 flex-1 truncate text-left ${buttonClass} ${selectedLight === light.id ? "border-primary" : ""}`}
                      onClick={() => setSelectedLight(light.id)}
                      type="button"
                    >
                      {light.name} · {light.type}
                    </button>
                    <label className="flex items-center gap-1" title="Enable light">
                      <input
                        aria-label={`Enable ${light.name}`}
                        checked={light.enabled}
                        onChange={(event) =>
                          updateLight(light.id, (current) =>
                            patchLight(current, { enabled: event.target.checked }),
                          )
                        }
                        type="checkbox"
                      />
                      on
                    </label>
                    <label className="flex items-center gap-1" title="Show light">
                      <input
                        aria-label={`Show ${light.name}`}
                        checked={light.visible}
                        onChange={(event) =>
                          updateLight(light.id, (current) =>
                            patchLight(current, { visible: event.target.checked }),
                          )
                        }
                        type="checkbox"
                      />
                      vis
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                <select
                  aria-label="New light type"
                  className={inputClass}
                  onChange={(event) => setLightTypeToAdd(event.target.value as LightType)}
                  value={lightTypeToAdd}
                >
                  <option value="ambient">Ambient</option>
                  <option value="hemisphere">Hemisphere</option>
                  <option value="directional">Directional</option>
                  <option value="point">Point</option>
                  <option value="spot">Spot</option>
                  <option value="rectArea">Rect area</option>
                </select>
                <button className={buttonClass} onClick={addLight} type="button">
                  Add light
                </button>
              </div>
              {selectedLightItem && (
                <>
                  <div className="mb-3 flex gap-2">
                    <button className={buttonClass} onClick={duplicateLight} type="button">
                      Duplicate light
                    </button>
                    <button className={buttonClass} onClick={deleteLight} type="button">
                      Delete light
                    </button>
                  </div>
                  {("target" in selectedLightItem) && (
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-2">
                      <span className="text-xs font-bold text-on-surface">3D Gizmo Arrow:</span>
                      <div className="flex gap-1">
                        <button
                          className={`${buttonClass} text-xs py-1 px-2 ${lightTargetMode === "position" ? "border-primary bg-primary-container font-bold text-on-primary-container" : ""}`}
                          onClick={() => onLightTargetModeChange?.("position")}
                          type="button"
                        >
                          Move Light Position
                        </button>
                        <button
                          className={`${buttonClass} text-xs py-1 px-2 ${lightTargetMode === "target" ? "border-primary bg-primary-container font-bold text-on-primary-container" : ""}`}
                          onClick={() => onLightTargetModeChange?.("target")}
                          type="button"
                        >
                          Move Target Aim
                        </button>
                      </div>
                    </div>
                  )}
                  <LightInspector
                    key={selectedLightItem.id}
                    light={selectedLightItem}
                    onChange={(next) => updateLight(selectedLightItem.id, () => next)}
                  />
                </>
              )}
            </section>
          )}

          {tab === "environment" && (
            cubeStudioActive ? (
              <section aria-label="Cube Studio Environment" className="space-y-4">
                <div className="space-y-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                    Cube Enclosure &amp; 3D Position
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(["X", "Y", "Z"] as const).map((axis, axisIdx) => (
                      <label key={`cube-pos-${axis}`} className="text-xs">
                        Position {axis}
                        <input
                          className={inputClass}
                          type="number"
                          step={5}
                          value={(configuration.cubeStudio?.position ?? [0, 80, 0])[axisIdx]}
                          onChange={(e) =>
                            onConfigurationChange((c) => {
                              const prev = [...(c.cubeStudio?.position ?? [0, 80, 0])] as VectorTuple;
                              prev[axisIdx] = Number(e.target.value);
                              return {
                                ...c,
                                cubeStudio: {
                                  ...(c.cubeStudio ?? defaultCubeStudio),
                                  position: prev,
                                },
                              };
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs">
                      Interior Color
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="color"
                          className="h-8 w-10 cursor-pointer rounded border border-outline-variant bg-transparent p-0"
                          value={configuration.cubeStudio?.interiorColor ?? "#050508"}
                          onChange={(e) =>
                            onConfigurationChange((c) => ({
                              ...c,
                              cubeStudio: {
                                ...(c.cubeStudio ?? defaultCubeStudio),
                                interiorColor: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          className={inputClass}
                          value={configuration.cubeStudio?.interiorColor ?? "#050508"}
                          onChange={(e) =>
                            onConfigurationChange((c) => ({
                              ...c,
                              cubeStudio: {
                                ...(c.cubeStudio ?? defaultCubeStudio),
                                interiorColor: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </label>
                    <label className="text-xs">
                      Cube Size (width)
                      <input
                        className={inputClass}
                        type="number"
                        min={10}
                        max={100}
                        step={1}
                        value={configuration.cubeStudio?.cubeSize ?? 36}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              cubeSize: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs">
                      Roughness ({configuration.cubeStudio?.roughness ?? 0.95})
                      <input
                        className={inputClass}
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={configuration.cubeStudio?.roughness ?? 0.95}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              roughness: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Metalness ({configuration.cubeStudio?.metalness ?? 0.05})
                      <input
                        className={inputClass}
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={configuration.cubeStudio?.metalness ?? 0.05}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              metalness: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                    Cube Camera Framing
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-xs">
                      Distance
                      <input
                        className={inputClass}
                        type="number"
                        min={1}
                        max={15}
                        step={0.2}
                        value={configuration.cubeStudio?.cameraDistance ?? 3.8}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              cameraDistance: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Height
                      <input
                        className={inputClass}
                        type="number"
                        min={-5}
                        max={10}
                        step={0.2}
                        value={configuration.cubeStudio?.cameraHeight ?? 1.2}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              cameraHeight: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Transition (s)
                      <input
                        className={inputClass}
                        type="number"
                        min={0.2}
                        max={5}
                        step={0.1}
                        value={configuration.cubeStudio?.transitionDuration ?? 2.2}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              transitionDuration: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </section>
            ) : (
              <EnvironmentInspector environment={configuration.environment} onChange={setEnvironment} />
            )
          )}

          {tab === "camera" && (
            cubeStudioActive ? (
              <section aria-label="Cube Camera Framing" className="space-y-3">
                <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                    Cube View Camera Framing
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Orbit controls (rotate & zoom) are active in Cube View. Adjust camera framing defaults:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="text-xs">
                      Distance
                      <input
                        className={inputClass}
                        type="number"
                        min={1}
                        max={15}
                        step={0.2}
                        value={configuration.cubeStudio?.cameraDistance ?? 3.8}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              cameraDistance: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Height
                      <input
                        className={inputClass}
                        type="number"
                        min={-5}
                        max={10}
                        step={0.2}
                        value={configuration.cubeStudio?.cameraHeight ?? 1.2}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              cameraHeight: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Transition (s)
                      <input
                        className={inputClass}
                        type="number"
                        min={0.2}
                        max={5}
                        step={0.1}
                        value={configuration.cubeStudio?.transitionDuration ?? 2.2}
                        onChange={(e) =>
                          onConfigurationChange((c) => ({
                            ...c,
                            cubeStudio: {
                              ...(c.cubeStudio ?? defaultCubeStudio),
                              transitionDuration: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </section>
            ) : (
              <section aria-label="Camera path">
                <label className="mb-3 block">
                  <span className="mb-1 block">Camera stop</span>
                  <select
                    className={inputClass}
                    onChange={(event) => setSelectedCamera(Number(event.target.value))}
                    value={selectedCamera}
                  >
                    {configuration.cameraStops.map((stop, index) => (
                      <option key={`${stop.view}-${index}`} value={index}>
                        {index + 1}. {stop.view} ({stop.progress})
                      </option>
                    ))}
                  </select>
                </label>
                {configuration.cameraStops[selectedCamera] && (
                  <>
                    <label className="mb-3 block">
                      <span className="mb-1 block">Scroll progress</span>
                      <input
                        aria-label="Camera stop progress"
                        className={inputClass}
                        max="1"
                        min="0"
                        onChange={(event) => updateCameraProgress(event.target.value)}
                        step="0.01"
                        type="number"
                        value={configuration.cameraStops[selectedCamera].progress}
                      />
                    </label>
                    {(["position", "target"] as const).map((field) => (
                      <VectorFields
                        field={`camera ${field}`}
                        key={field}
                        value={configuration.cameraStops[selectedCamera][field]}
                        onChange={(axis, value) => updateCameraAxis(field, axis, value)}
                      />
                    ))}
                  </>
                )}
              </section>
            )
          )}

          {tab === "configuration" && (
            <section aria-label="Configuration import and export" className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button className={buttonClass} onClick={() => void copyConfiguration()} type="button">
                  Copy configuration
                </button>
                <button className={buttonClass} onClick={exportFile} type="button">
                  Download JSON
                </button>
                <label className={`${buttonClass} cursor-pointer`}>
                  Import JSON file
                  <input accept="application/json,.json" className="sr-only" onChange={(event) => void importFile(event)} type="file" />
                </label>
              </div>
              <textarea
                aria-label="Scene configuration JSON"
                className={`${inputClass} h-32 resize-y font-mono text-xs`}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="Paste scene configuration JSON to import"
                value={importText}
              />
              <button className={buttonClass} onClick={() => importConfiguration(importText)} type="button">
                Validate and import pasted JSON
              </button>

              <div className="border-t border-outline-variant pt-3">
                <button className={`${buttonClass} mb-2`} onClick={loadSavedPresets} type="button">
                  Load saved presets
                </button>
                <label className="mb-2 block">
                  <span className="mb-1 block">Saved preset</span>
                  <select
                    className={inputClass}
                    onChange={(event) => setSelectedPreset(event.target.value)}
                    value={selectedPreset}
                  >
                    <option value="">Choose preset</option>
                    {Object.keys(presets).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <div className="mb-2 flex gap-2">
                  <button className={buttonClass} onClick={loadPreset} type="button">Load preset</button>
                  {selectedPreset && (
                    <button
                      className={buttonClass}
                      onClick={() => {
                        const next = { ...presets };
                        delete next[selectedPreset];
                        try {
                          localStorage.setItem(presetsKey, JSON.stringify(next));
                          setPresets(next);
                          setSelectedPreset("");
                          setMessage(`Deleted preset "${selectedPreset}".`);
                        } catch (error) {
                          setMessage(`Could not delete preset: ${error instanceof Error ? error.message : String(error)}`);
                        }
                      }}
                      type="button"
                    >
                      Delete preset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    aria-label="New preset name"
                    className={inputClass}
                    onChange={(event) => setPresetName(event.target.value)}
                    placeholder="Preset name"
                    value={presetName}
                  />
                  <button className={buttonClass} onClick={savePreset} type="button">Save preset</button>
                </div>
              </div>
            </section>
          )}

          <p aria-live="polite" className="mt-3 min-h-5 text-xs text-on-surface-variant">
            {message}
          </p>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document === "undefined"
    ? null
    : createPortal(
        <>
          {editor}
          {toast && (
            <aside
              aria-live="polite"
              className="fixed right-5 top-5 z-[99999] flex max-w-sm items-center gap-3 rounded-xl border-2 border-primary bg-surface-container-lowest p-3.5 shadow-[4px_4px_0px_#080d22] transition-all"
              role="status"
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  toast.type === "error" ? "text-error" : "text-primary"
                }`}
                aria-hidden="true"
              >
                {toast.type === "error" ? "error" : "check_circle"}
              </span>
              <div className="flex-1 text-sm font-bold text-on-surface">
                {toast.message}
              </div>
              <button
                aria-label="Dismiss notification"
                className="material-symbols-outlined cursor-pointer text-lg text-on-surface-variant hover:text-on-surface"
                onClick={() => setToast(null)}
                type="button"
              >
                close
              </button>
            </aside>
          )}
        </>,
        document.body,
      );
}

function TransformFields({
  transform,
  draftValues,
  selectedId,
  onAxisChange,
  onAxisBlur,
}: {
  transform: SceneObjectTransform;
  draftValues: Record<string, string>;
  selectedId: string;
  onAxisChange: (field: keyof SceneObjectTransform, axis: number, value: string) => void;
  onAxisBlur: (key: string) => void;
}) {
  return (
    <div className="space-y-2">
      {(["position", "rotation", "scale"] as const).map((field) => (
        <fieldset className="grid grid-cols-3 gap-2" key={field}>
          <legend className="col-span-3 mb-1 capitalize">
            {field}{field === "rotation" ? " (degrees)" : ""}
          </legend>
          {(["X", "Y", "Z"] as const).map((axis, index) => {
            const key = `${selectedId}-${field}-${index}`;
            return (
              <label className="text-xs min-w-0" key={axis}>
                <span className="mr-1 text-on-surface-variant">{axis}</span>
                <input
                  aria-label={`${selectedId} ${field} ${axis}`}
                  className={inputClass}
                  onBlur={() => onAxisBlur(key)}
                  onChange={(event) => onAxisChange(field, index, event.target.value)}
                  step={field === "rotation" ? "1" : field === "scale" ? "0.05" : "0.1"}
                  type="number"
                  value={draftValues[key] ?? transform[field][index]}
                />
              </label>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

function VectorFields({
  field,
  value,
  onChange,
}: {
  field: string;
  value: VectorTuple;
  onChange: (axis: number, value: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  return (
    <fieldset className="mb-3 grid grid-cols-3 gap-2">
      <legend className="col-span-3 mb-1 capitalize">{field}</legend>
      {(["X", "Y", "Z"] as const).map((axis, index) => (
        <label className="text-xs min-w-0" key={axis}>
          <span className="mr-1 text-on-surface-variant">{axis}</span>
          <input
            aria-label={`${field} ${axis}`}
            className={inputClass}
            onBlur={() =>
              setDrafts((current) => {
                const next = { ...current };
                delete next[index];
                return next;
              })
            }
            onChange={(event) => {
              const nextValue = event.target.value;
              setDrafts((current) => ({ ...current, [index]: nextValue }));
              onChange(index, nextValue);
            }}
            step="0.1"
            type="number"
            value={drafts[index] ?? value[index]}
          />
        </label>
      ))}
    </fieldset>
  );
}

function LightInspector({
  light,
  onChange,
}: {
  light: SceneLight;
  onChange: (light: SceneLight) => void;
}) {
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const colorInput = (
    <label className="mb-2 block">
      <span className="mb-1 block">Color</span>
      <input
        aria-label={`${light.name} color`}
        className="h-10 w-full rounded-md border border-outline-variant bg-surface-container-low"
        onChange={(event) => onChange(patchLight(light, { color: event.target.value }))}
        type="color"
        value={light.color}
      />
    </label>
  );
  const commonInputs = (
    <>
      <label className="mb-2 block">
        <span className="mb-1 block">Light name</span>
        <input
          className={inputClass}
          onBlur={() => setNameDraft(null)}
          onChange={(event) => {
            setNameDraft(event.target.value);
            if (event.target.value.trim()) {
              onChange(patchLight(light, { name: event.target.value }));
            }
          }}
          value={nameDraft ?? light.name}
        />
      </label>
      {colorInput}
      <label className="mb-3 block">
        <span className="mb-1 block">Intensity</span>
        <input
          className={inputClass}
          max="20"
          min="0"
          onChange={(event) => {
            const intensity = Number(event.target.value);
            if (Number.isFinite(intensity)) onChange(patchLight(light, { intensity }));
          }}
          step="0.1"
          type="number"
          value={light.intensity}
        />
        <input
          aria-label={`${light.name} intensity slider`}
          className="mt-2 w-full accent-primary"
          max="20"
          min="0"
          onChange={(event) => {
            const intensity = Number(event.target.value);
            if (Number.isFinite(intensity)) onChange(patchLight(light, { intensity }));
          }}
          step="0.1"
          type="range"
          value={light.intensity}
        />
      </label>
    </>
  );
  const shadowInput = (shadows: boolean, update: (value: boolean) => void) => (
    <label className="mb-3 flex items-center gap-2">
      <input checked={shadows} onChange={(event) => update(event.target.checked)} type="checkbox" />
      Cast shadows
    </label>
  );

  switch (light.type) {
    case "ambient":
      return commonInputs;
    case "hemisphere":
      return (
        <>
          {commonInputs}
          <label className="mb-2 block">
            <span className="mb-1 block">Ground color</span>
            <input
              className="h-10 w-full"
              onChange={(event) => onChange(patchLight(light, { groundColor: event.target.value }))}
              type="color"
              value={light.groundColor}
            />
          </label>
        </>
      );
    case "directional":
      return (
        <>
          {commonInputs}
          <VectorFields field="position" value={light.position} onChange={(axis, value) => updateLightVector(light, "position", axis, value, onChange)} />
          <VectorFields field="target" value={light.target} onChange={(axis, value) => updateLightVector(light, "target", axis, value, onChange)} />
          {shadowInput(light.shadows, (shadows) => onChange(patchLight(light, { shadows })))}
        </>
      );
    case "point":
      return (
        <>
          {commonInputs}
          <VectorFields field="position" value={light.position} onChange={(axis, value) => updateLightVector(light, "position", axis, value, onChange)} />
          <LightNumberField label="Distance" value={light.distance} onChange={(distance) => onChange(patchLight(light, { distance }))} />
          <LightNumberField label="Decay" value={light.decay} onChange={(decay) => onChange(patchLight(light, { decay }))} />
          {shadowInput(light.shadows, (shadows) => onChange(patchLight(light, { shadows })))}
        </>
      );
    case "spot":
      return (
        <>
          {commonInputs}
          <VectorFields field="position" value={light.position} onChange={(axis, value) => updateLightVector(light, "position", axis, value, onChange)} />
          <VectorFields field="target" value={light.target} onChange={(axis, value) => updateLightVector(light, "target", axis, value, onChange)} />
          <LightNumberField label="Angle (radians)" min={0.001} max={Math.PI / 2} value={light.angle} onChange={(angle) => onChange(patchLight(light, { angle }))} />
          <LightNumberField label="Penumbra" max={1} value={light.penumbra} onChange={(penumbra) => onChange(patchLight(light, { penumbra }))} />
          <LightNumberField label="Distance" value={light.distance} onChange={(distance) => onChange(patchLight(light, { distance }))} />
          <LightNumberField label="Decay" value={light.decay} onChange={(decay) => onChange(patchLight(light, { decay }))} />
          {shadowInput(light.shadows, (shadows) => onChange(patchLight(light, { shadows })))}
        </>
      );
    case "rectArea":
      return (
        <>
          {commonInputs}
          <VectorFields field="position" value={light.position} onChange={(axis, value) => updateLightVector(light, "position", axis, value, onChange)} />
          <VectorFields field="rotation (degrees)" value={light.rotation} onChange={(axis, value) => updateLightVector(light, "rotation", axis, value, onChange)} />
          <LightNumberField label="Width" min={0.01} value={light.width} onChange={(width) => onChange(patchLight(light, { width }))} />
          <LightNumberField label="Height" min={0.01} value={light.height} onChange={(height) => onChange(patchLight(light, { height }))} />
        </>
      );
  }
}

function updateLightVector(
  light: SceneLight,
  field: "position" | "target" | "rotation",
  axis: number,
  value: string,
  onChange: (light: SceneLight) => void,
) {
  const number = Number(value);
  if (!Number.isFinite(number) || value.trim() === "") return;
  if (field === "position" && "position" in light) {
    const next = copyVector(light.position);
    next[axis] = number;
    onChange({ ...light, position: next });
  } else if (field === "target" && "target" in light) {
    const next = copyVector(light.target);
    next[axis] = number;
    onChange({ ...light, target: next });
  } else if (field === "rotation" && light.type === "rectArea") {
    const next = copyVector(light.rotation);
    next[axis] = number;
    onChange({ ...light, rotation: next });
  }
}

function LightNumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block">{label}</span>
      <input
        className={inputClass}
        max={max}
        min={min}
        onChange={(event) => {
          const number = Number(event.target.value);
          if (Number.isFinite(number)) {
            onChange(Math.max(min, Math.min(max ?? Number.POSITIVE_INFINITY, number)));
          }
        }}
        step="0.1"
        type="number"
        value={value}
      />
    </label>
  );
}

function EnvironmentInspector({
  environment,
  onChange,
}: {
  environment: SceneEnvironment;
  onChange: (update: (environment: SceneEnvironment) => SceneEnvironment) => void;
}) {
  function setFog(update: (fog: SceneEnvironment["fog"]) => SceneEnvironment["fog"]) {
    onChange((current) => ({ ...current, fog: update(current.fog) }));
  }

  return (
    <section aria-label="Environment settings" className="space-y-2">
      <label className="mb-2 block">
        <span className="mb-1 block">Background color</span>
        <input
          className="h-10 w-full"
          onChange={(event) => onChange((current) => ({ ...current, background: event.target.value }))}
          type="color"
          value={environment.background}
        />
      </label>
      <label className="mb-2 block">
        <span className="mb-1 block">Environment intensity</span>
        <input
          className={inputClass}
          min="0"
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) onChange((current) => ({ ...current, environmentIntensity: Math.max(0, value) }));
          }}
          step="0.1"
          type="number"
          value={environment.environmentIntensity}
        />
      </label>
      <label className="mb-2 block">
        <span className="mb-1 block">Tone mapping</span>
        <select
          className={inputClass}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              toneMapping: event.target.value as SceneEnvironment["toneMapping"],
            }))
          }
          value={environment.toneMapping}
        >
          <option value="none">None</option>
          <option value="linear">Linear</option>
          <option value="reinhard">Reinhard</option>
          <option value="cineon">Cineon</option>
          <option value="aces">ACES Filmic</option>
        </select>
      </label>
      <label className="mb-2 block">
        <span className="mb-1 block">Exposure</span>
        <input
          className={inputClass}
          min="0.01"
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) onChange((current) => ({ ...current, exposure: Math.max(0.01, value) }));
          }}
          step="0.1"
          type="number"
          value={environment.exposure}
        />
      </label>
      <label className="mb-2 block">
        <span className="mb-1 block">Pixel ratio cap</span>
        <input
          className={inputClass}
          max="2"
          min="1"
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) onChange((current) => ({ ...current, pixelRatioCap: Math.max(1, Math.min(2, value)) }));
          }}
          step="0.1"
          type="number"
          value={environment.pixelRatioCap}
        />
      </label>
      <label className="mb-3 flex items-center gap-2">
        <input
          checked={environment.shadows}
          onChange={(event) => onChange((current) => ({ ...current, shadows: event.target.checked }))}
          type="checkbox"
        />
        Enable scene shadows
      </label>
      <fieldset className="border-t border-outline-variant pt-3">
        <legend className="mb-2 font-bold">Fog</legend>
        <label className="mb-2 flex items-center gap-2">
          <input checked={environment.fog.enabled} onChange={(event) => setFog((fog) => ({ ...fog, enabled: event.target.checked }))} type="checkbox" />
          Enable fog
        </label>
        <label className="mb-2 block">
          <span className="mb-1 block">Fog color</span>
          <input className="h-10 w-full" onChange={(event) => setFog((fog) => ({ ...fog, color: event.target.value }))} type="color" value={environment.fog.color} />
        </label>
        {(["near", "far"] as const).map((field) => (
          <label className="mb-2 block" key={field}>
            <span className="mb-1 block capitalize">{field}</span>
            <input
              className={inputClass}
              min="0"
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value)) return;
                setFog((fog) =>
                  field === "near"
                    ? { ...fog, near: Math.max(0, Math.min(value, fog.far - 0.01)) }
                    : { ...fog, far: Math.max(value, fog.near + 0.01) },
                );
              }}
              step="0.1"
              type="number"
              value={environment.fog[field]}
            />
          </label>
        ))}
      </fieldset>
      <p className="text-xs text-on-surface-variant">
        Environment maps are not configured in this project; color, fog, renderer exposure and tone mapping are supported.
      </p>
    </section>
  );
}
