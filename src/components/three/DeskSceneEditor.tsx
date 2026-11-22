"use client";

import { TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { Group } from "three";
import {
  parseSceneConfiguration,
  serializeSceneConfiguration,
} from "./config/sceneSerialization";
import type {
  SceneCameraStop,
  SceneConfiguration,
  SceneLight,
  SceneObjectInstance,
  SceneObjectTransform,
  SceneEnvironment,
  SceneInteractionAction,
  ScenePrimitiveType,
  SceneObjectAnimation,
} from "./config/sceneTypes";
import { assetRegistry } from "./registry/assetRegistry";
import type { VectorTuple, TransformMode } from "./deskSceneLayout";

type EditorTab = "objects" | "lights" | "environment" | "camera" | "configuration";
type TransformSpace = "world" | "local";
type LightType = SceneLight["type"];

const presetsKey = "malay-portfolio-scene-presets-v1";
const panelClass =
  "rounded-xl border-2 border-surface-variant bg-surface-container-lowest p-3 text-on-surface shadow-[4px_4px_0px_#080d22]";
const inputClass =
  "w-full rounded-md border border-outline-variant bg-surface-container-low px-2 py-2 text-on-surface";
const buttonClass =
  "rounded-md border border-outline-variant bg-surface-container-low px-2 py-2 hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

function uniqueId(prefix: string) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  onResetAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  expanded,
  onExpandedChange,
  embeddedAnimations,
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
  onResetAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  embeddedAnimations: Record<string, string[]>;
}) {
  const [tab, setTab] = useState<EditorTab>("objects");
  const [search, setSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetToAdd, setAssetToAdd] = useState("");
  const [lightTypeToAdd, setLightTypeToAdd] = useState<LightType>("point");
  const [selectedLight, setSelectedLight] = useState(configuration.lights[0]?.id ?? "");
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [presets, setPresets] = useState<Record<string, SceneConfiguration>>({});
  const [actionTypeToAdd, setActionTypeToAdd] = useState<SceneInteractionAction["type"]>("showInformation");
  const [primitiveType, setPrimitiveType] = useState<ScenePrimitiveType>("box");
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; panelX: number; panelY: number } | null>(null);

  const selectedObject =
    configuration.objects.find((object) => object.id === selected && object.id !== "room") ??
    configuration.objects.find((object) => object.id !== "room");
  const filteredObjects = configuration.objects.filter((object) =>
    object.id !== "room" &&
    `${object.name} ${object.assetId}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredLights = configuration.lights.filter((light) =>
    `${light.name} ${light.type}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedAsset = selectedObject
    ? assetRegistry.find((asset) => asset.id === selectedObject.assetId)
    : undefined;
  const selectedLightItem =
    configuration.lights.find((light) => light.id === selectedLight) ??
    configuration.lights[0];

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
        {action.type === "customAction" && (
          <label>Controlled action name<input className={inputClass} value={action.name} onChange={(event) => onChange({ ...action, name: event.target.value })} /></label>
        )}
      </div>
    );
  }

  function updateObject(id: string, update: (object: SceneObjectInstance) => SceneObjectInstance) {
    onConfigurationChange((current) => ({
      ...current,
      objects: current.objects.map((object) => (object.id === id ? update(object) : object)),
    }));
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
    onConfigurationChange((current) => ({
      ...current,
      lights: current.lights.map((light) => (light.id === id ? update(light) : light)),
    }));
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
      castShadow: false,
      receiveShadow: false,
      interactions: { enabled: false, trigger: "click", actions: [] },
      transform: {
        position: [source[0] + 0.4, source[1], source[2]],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    };
    onConfigurationChange((current) => ({ ...current, objects: [...current.objects, object] }));
    onSelectedChange(object.id);
    setMessage(`Added ${asset.displayName}.`);
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
        position: [source[0] + 0.4, source[1], source[2]],
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
      },
      interactions: { enabled: false, trigger: "click", actions: [] },
    };
    onConfigurationChange((current) => ({ ...current, objects: [...current.objects, object] }));
    onSelectedChange(object.id);
    setMessage(`Added ${primitiveType} primitive.`);
  }

  function duplicateObject() {
    if (!selectedObject) return;
    const duplicate: SceneObjectInstance = {
      ...structuredClone(selectedObject),
      id: uniqueId(selectedObject.assetId),
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
    onConfigurationChange((current) => ({
      ...current,
      objects: [...current.objects, duplicate],
    }));
    onSelectedChange(duplicate.id);
    setMessage(`Duplicated ${selectedObject.name}.`);
  }

  function deleteObject() {
    if (!selectedObject) return;
    const remaining = configuration.objects.filter(
      (object) => object.id !== "room" && object.id !== selectedObject.id,
    );
    onConfigurationChange((current) => ({
      ...current,
      objects: current.objects.filter((object) => object.id !== selectedObject.id),
    }));
    onSelectedChange(remaining[0]?.id ?? "");
    setMessage(`Deleted ${selectedObject.name}.`);
  }

  function addLight() {
    const light = newLight(lightTypeToAdd);
    onConfigurationChange((current) => ({ ...current, lights: [...current.lights, light] }));
    setSelectedLight(light.id);
    setMessage(`Added ${light.name}.`);
  }

  function duplicateLight() {
    if (!selectedLightItem) return;
    const light = { ...structuredClone(selectedLightItem), id: uniqueId(selectedLightItem.type), name: `${selectedLightItem.name} copy` };
    onConfigurationChange((current) => ({ ...current, lights: [...current.lights, light] }));
    setSelectedLight(light.id);
  }

  function deleteLight() {
    if (!selectedLightItem) return;
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
  }

  async function copyConfiguration() {
    try {
      await navigator.clipboard.writeText(serializeSceneConfiguration(configuration));
      setMessage("Complete scene configuration copied.");
    } catch (error) {
      setMessage(
        `Could not copy configuration: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  function importConfiguration(source: string) {
    try {
      const imported = parseSceneConfiguration(source);
      onConfigurationChange(() => imported);
      onSelectedChange(imported.objects.find((object) => object.id !== "room")?.id ?? "");
      setImportText("");
      setMessage("Scene configuration imported and validated.");
    } catch (error) {
      setMessage(
        `Import failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      importConfiguration(await file.text());
    } catch (error) {
      setMessage(`Could not read configuration file: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      event.target.value = "";
    }
  }

  function savePreset() {
    const name = presetName.trim();
    if (!name) {
      setMessage("Enter a name for this preset.");
      return;
    }
    try {
      const next = { ...presets, [name]: structuredClone(configuration) };
      localStorage.setItem(presetsKey, JSON.stringify(next));
      setPresets(next);
      setSelectedPreset(name);
      setPresetName("");
      setMessage(`Saved preset "${name}".`);
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
    <div className={`${expanded ? "fixed inset-0 z-[80] pointer-events-none" : "fixed bottom-4 right-4 z-[80] pointer-events-none"} font-label-code-sm text-label-code-sm text-on-surface`}>
      <div className="pointer-events-auto ml-auto flex w-fit gap-1 pr-0">
        {open && expanded && (
          <button
            aria-label="Exit full-screen editor"
            className={`${buttonClass} flex h-10 w-10 items-center justify-center shadow-[2px_2px_0px_#080d22]`}
            onClick={() => onExpandedChange(false)}
            title="Exit full screen"
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        )}
        {open && (
          <button
            aria-label={expanded ? "Exit full-screen scene" : "Open full-screen scene"}
            className={`${buttonClass} flex h-10 items-center gap-2 shadow-[2px_2px_0px_#080d22]`}
            onClick={() => onExpandedChange(!expanded)}
            type="button"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {expanded ? "close_fullscreen" : "open_in_full"}
            </span>
            {expanded ? "Exit full screen" : "Full screen"}
          </button>
        )}
        <button
          aria-expanded={open}
          className={`${buttonClass} flex h-10 items-center gap-2 shadow-[2px_2px_0px_#080d22]`}
          onClick={() => onOpenChange(!open)}
          type="button"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            {open ? "close" : "tune"}
          </span>
          {open ? "Close scene editor" : "Edit scene"}
        </button>
      </div>

      {open && (
        <div
          className={`pointer-events-auto mt-2 overflow-y-auto ${expanded ? "fixed right-5 top-16 max-h-[calc(100vh-5rem)] w-[min(38rem,calc(100%-2.5rem))]" : "fixed bottom-16 right-4 max-h-[calc(100vh-6rem)] w-[min(38rem,calc(100%-2rem))]"} ${panelClass}`}
          style={{ transform: `translate(${panelPosition.x}px, ${panelPosition.y}px)` }}
        >
          <div
            className="mb-3 flex cursor-move touch-none flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3"
            onPointerDown={startPanelDrag}
            onPointerMove={movePanelDrag}
            onPointerUp={endPanelDrag}
            onPointerCancel={endPanelDrag}
          >
            <label className="flex items-center gap-2 font-bold">
              <input
                checked={configuration.enabled}
                onChange={(event) =>
                  onConfigurationChange((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Use edited scene configuration
            </label>
            <div className="flex gap-1">
              <button aria-label="Undo scene change" className={buttonClass} disabled={!canUndo} onClick={onUndo} type="button">
                Undo
              </button>
              <button aria-label="Redo scene change" className={buttonClass} disabled={!canRedo} onClick={onRedo} type="button">
                Redo
              </button>
              <button className={buttonClass} onClick={onResetAll} type="button">
                Reset
              </button>
            </div>
          </div>

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

          <div aria-label="Editor panels" className="mb-3 grid grid-cols-3 gap-1 sm:grid-cols-5">
            {tabs.map(({ id, label }) => (
              <button
                aria-pressed={tab === id}
                className={`${buttonClass} ${tab === id ? "border-primary bg-primary-container font-bold text-on-primary-container" : ""}`}
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
              <label className="mb-2 block">
                <span className="mb-1 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">view_in_ar</span>
                  Selected object
                </span>
                <select
                  aria-label="Selected scene object"
                  className={inputClass}
                  onChange={(event) => onSelectedChange(event.target.value)}
                  value={selectedObject?.id ?? ""}
                >
                  {configuration.objects
                    .filter((object) => object.id !== "room")
                    .map((object) => (
                      <option key={object.id} value={object.id}>
                        {object.name}
                      </option>
                    ))}
                </select>
              </label>
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
                      Duplicate
                    </button>
                    <button className={buttonClass} onClick={deleteObject} type="button">
                      Delete
                    </button>
                    <button className={buttonClass} onClick={() => onResetSelected(selectedObject.id)} type="button">
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
                        <label className="flex items-center justify-between gap-2">
                          <span>Default animation</span>
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
                            {(embeddedAnimations[selectedObject.id] ?? []).map((clipName) => (
                              <option key={`embedded-${clipName}`} value={`embedded:${clipName}`}>
                                Embedded: {clipName}
                              </option>
                            ))}
                          </select>
                        </label>
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
                          {(embeddedAnimations[selectedObject.id] ?? []).map((clipName) => (
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
                              Add {clipName}
                            </button>
                          ))}
                        </div>
                        {(selectedObject.animations ?? []).map((animation, index) => (
                          <div className="grid gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-2" key={animation.id}>
                            <div className="grid grid-cols-2 gap-2">
                              <label>Name<input className={inputClass} value={animation.name} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} /></label>
                              <label>Type<select className={inputClass} value={animation.type} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as "embedded" | "preset", preset: event.target.value === "preset" ? "pulse" : undefined, clipName: event.target.value === "embedded" ? (item.clipName ?? "") : undefined } : item) }))}><option value="preset">Custom preset</option><option value="embedded">Embedded clip</option></select></label>
                            </div>
                            {animation.type === "preset" ? (
                              <label>Preset<select className={inputClass} value={animation.preset ?? "pulse"} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, preset: event.target.value as "pulse" | "bounce" | "rotate" | "violin-sway" } : item) }))}><option value="pulse">Pulse</option><option value="bounce">Bounce</option><option value="rotate">Rotate</option><option value="violin-sway">Violin sway</option></select></label>
                            ) : (
                              <label>Embedded clip<select className={inputClass} value={animation.clipName ?? ""} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, clipName: event.target.value } : item) }))}><option value="">Choose clip</option>{(embeddedAnimations[selectedObject.id] ?? []).map((clipName) => <option key={clipName} value={clipName}>{clipName}</option>)}</select></label>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <label>Speed<input className={inputClass} min={0.1} step={0.1} type="number" value={animation.timeScale} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, timeScale: Number(event.target.value) } : item) }))} /></label>
                              <label className="flex items-center gap-2"><input checked={animation.loop} type="checkbox" onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, loop: event.target.checked } : item) }))} />Loop</label>
                            </div>
                            <button className={buttonClass} onClick={() => updateObject(selectedObject.id, (object) => ({ ...object, animations: (object.animations ?? []).filter((_, itemIndex) => itemIndex !== index), defaultAnimationId: object.defaultAnimationId === animation.id ? undefined : object.defaultAnimationId }))} type="button">Remove animation</button>
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
                        <div className="border-t border-outline-variant pt-3">
                          <label className="flex items-center gap-2">
                            <input
                              checked={selectedObject.glow?.enabled ?? false}
                              type="checkbox"
                              onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: { enabled: event.target.checked, color: object.glow?.color ?? "#ffffff", intensity: object.glow?.intensity ?? 1 } }))}
                            />
                            Emit light
                          </label>
                          {selectedObject.glow?.enabled && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <label>Glow color<input className={inputClass} type="color" value={selectedObject.glow.color} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: object.glow ? { ...object.glow, color: event.target.value } : undefined }))} /></label>
                              <label>Light intensity<input className={inputClass} min={0} step={0.1} type="number" value={selectedObject.glow.intensity} onChange={(event) => updateObject(selectedObject.id, (object) => ({ ...object, glow: object.glow ? { ...object.glow, intensity: Number(event.target.value) } : undefined }))} /></label>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`${buttonClass} mt-3`}
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
                          },
                          glow: { enabled: false, color: "#ffffff", intensity: 0 },
                        }))}
                        type="button"
                      >
                        Add material controls
                      </button>
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
            <EnvironmentInspector environment={configuration.environment} onChange={setEnvironment} />
          )}

          {tab === "camera" && (
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
      )}
    </div>
  );

  return typeof document === "undefined" ? null : createPortal(editor, document.body);
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
              <label className="text-xs" key={axis}>
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
        <label className="text-xs" key={axis}>
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
