"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface ExtendedHTMLElement extends HTMLDivElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface ExtendedScreenOrientation extends ScreenOrientation {
  lock?: (orientation: "landscape" | "portrait" | "any") => Promise<void>;
}
import {
  DeskSceneEditor,
  SceneTransformGizmo,
  SceneLightGizmo,
  type EditorTab,
} from "../three/DeskSceneEditor";
import { type TransformMode, type VectorTuple } from "../three/deskSceneLayout";
import {
  copyDefaultSceneConfiguration,
  defaultSceneConfiguration,
  cameraProgress,
} from "../three/config/defaultScene";
import type {
  CameraView,
  CubeStudioConfiguration,
  SceneCameraStop,
  SceneConfiguration,
  SceneLight,
  SceneObjectInstance,
  SceneInteractionAction,
} from "../three/config/sceneTypes";
import { ConfiguredSceneRuntime } from "../three/runtime/ConfiguredSceneRuntime";
import { SceneInteractionController } from "../three/runtime/SceneInteractionController";
import { DeskSceneSkeleton } from "../three/DeskSceneSkeleton";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";
import {
  getResponsiveSceneConfiguration,
  getResponsiveCameraFov,
} from "../three/config/responsiveSceneConfig";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentRef,
  type RefObject,
} from "react";
import { Box3, Vector3, type Object3D, type Group } from "three";

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

function BowPlayingAnimation({
  bow,
  strings,
  story,
  animationToken,
}: {
  bow: RefObject<Object3D | null>;
  strings: RefObject<Object3D | null>;
  story: RefObject<HTMLDivElement | null>;
  animationToken: number;
}) {
  const basePosition = useRef(new Vector3());
  const baseRotation = useRef(new Vector3());
  const initialized = useRef(false);

  useEffect(() => {
    const bowObject = bow.current;
    const stringsObject = strings.current;
    if (!bowObject || !stringsObject || initialized.current) return;

    bowObject.updateWorldMatrix(true, true);
    stringsObject.updateWorldMatrix(true, true);
    const bowBounds = new Box3().setFromObject(bowObject);
    const stringsBounds = new Box3().setFromObject(stringsObject);
    const bowCenter = bowBounds.getCenter(new Vector3());
    const stringsCenter = stringsBounds.getCenter(new Vector3());

    const worldDelta = stringsCenter.sub(bowCenter);
    if (bowObject.parent) {
      worldDelta
        .applyQuaternion(bowObject.parent.quaternion.clone().invert())
        .divide(bowObject.parent.scale);
    }
    bowObject.position.add(worldDelta);
    bowObject.updateMatrixWorld(true);

    basePosition.current.copy(bowObject.position);
    baseRotation.current.set(
      bowObject.rotation.x,
      bowObject.rotation.y,
      bowObject.rotation.z,
    );
    initialized.current = true;
  });

  useFrame(({ clock }) => {
    const bowObject = bow.current;
    const storyElement = story.current;
    if (!bowObject || !storyElement || !initialized.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const storyRect = storyElement.getBoundingClientRect();
    const onScreen =
      storyRect.bottom > 0 &&
      storyRect.top < window.innerHeight;

    if (reducedMotion || !onScreen) {
      bowObject.position.copy(basePosition.current);
      bowObject.rotation.set(
        baseRotation.current.x,
        baseRotation.current.y,
        baseRotation.current.z,
      );
      return;
    }

    const time = clock.elapsedTime;
    const playingBoost = animationToken > 0 ? 1.8 : 1;
    const stroke = Math.sin(time * 2.8) * playingBoost;
    const returnStroke = Math.sin(time * 5.6) * playingBoost;

    bowObject.position.set(
      basePosition.current.x + stroke * 0.24,
      basePosition.current.y + Math.abs(returnStroke) * 0.05,
      basePosition.current.z + stroke * 0.06,
    );
    bowObject.rotation.set(
      baseRotation.current.x + returnStroke * 0.06,
      baseRotation.current.y + stroke * 0.08,
      baseRotation.current.z + stroke * 0.05,
    );
  });

  return null;
}

function CameraMotion({
  story,
  onStep,
  cameraStops,
  targetFov,
  editing = false,
  cubeViewActive = false,
  cubeStudioConfig,
  onTransitionProgress,
  manualProgress,
}: {
  story: RefObject<HTMLDivElement | null>;
  onStep: (view: CameraView) => void;
  cameraStops: SceneCameraStop[];
  targetFov?: number;
  editing?: boolean;
  cubeViewActive?: boolean;
  cubeStudioConfig?: CubeStudioConfiguration;
  onTransitionProgress?: (progress: number) => void;
  manualProgress?: number | null;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const nextPosition = useRef(new Vector3());
  const nextTarget = useRef(new Vector3());
  const currentTarget = useRef(new Vector3(0, 1.1, -1.2));
  const currentStep = useRef<CameraView>("overview");
  const transitionRef = useRef({ progress: 0, fromActive: false });

  // Track manual progress changes to animate to preset stops in edit mode
  const prevManualProgress = useRef<number | null | undefined>(manualProgress);
  const isAnimatingPreset = useRef(false);
  const presetStartTime = useRef(0);
  const wasEditing = useRef(editing);

  useEffect(() => {
    if (editing && !wasEditing.current) {
      if (controls.current) {
        controls.current.target.copy(currentTarget.current);
        controls.current.update();
      }
    }
    wasEditing.current = editing;
  }, [editing]);

  useEffect(() => {
    if (manualProgress !== prevManualProgress.current) {
      prevManualProgress.current = manualProgress;
      if (editing && manualProgress !== null && manualProgress !== undefined) {
        isAnimatingPreset.current = true;
        presetStartTime.current = performance.now();
      }
    }
  }, [manualProgress, editing]);

  useEffect(() => {
    const ctrl = controls.current;
    if (!ctrl) return;
    const onStart = () => {
      isAnimatingPreset.current = false;
    };
    ctrl.addEventListener("start", onStart);
    return () => {
      ctrl.removeEventListener("start", onStart);
    };
  }, [editing]);

  useFrame((state, delta) => {
    const element = story.current;
    if (!element) return;

    const transitionDuration = cubeStudioConfig?.transitionDuration ?? 2.2;
    const transitionSpeed = 1 / Math.max(0.1, transitionDuration);

    if (cubeViewActive) {
      transitionRef.current.progress = Math.min(
        1,
        transitionRef.current.progress + delta * transitionSpeed,
      );
    } else {
      transitionRef.current.progress = Math.max(
        0,
        transitionRef.current.progress - delta * transitionSpeed,
      );
    }
    const t = transitionRef.current.progress;
    onTransitionProgress?.(t);

    const distance = Math.max(element.offsetHeight - window.innerHeight, 0);
    const scroll = Math.max(0, -element.getBoundingClientRect().top);
    const scrollProgress = distance > 0 ? Math.min(1, Math.max(0, scroll / distance)) : 0;
    const progress =
      manualProgress !== null && manualProgress !== undefined ? manualProgress : scrollProgress;

    const stops = cameraStops;
    let start = stops[0];
    let end = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (progress >= stops[i].progress && progress <= stops[i + 1].progress) {
        start = stops[i];
        end = stops[i + 1];
        break;
      }
    }

    const amount =
      start === end
        ? 0
        : (progress - start.progress) / (end.progress - start.progress);

    position.current
      .set(...start.position)
      .lerp(nextPosition.current.set(...end.position), amount);
    target.current
      .set(...start.target)
      .lerp(nextTarget.current.set(...end.target), amount);

    const deskFov = targetFov ?? 42;
    const deskZoom = 1 + 1.1 * Math.max(0, Math.min(1, (progress - 0.72) / 0.28));

    const activeCamera = state.camera;

    if (t > 0) {
      const cubePos = cubeStudioConfig?.position ?? [0, 80, 0];
      const cameraDistance = cubeStudioConfig?.cameraDistance ?? 3.8;
      const cameraHeight = cubeStudioConfig?.cameraHeight ?? 1.2;

      const cubeTargetPos = new Vector3(
        cubePos[0],
        cubePos[1] + cameraHeight,
        cubePos[2] + cameraDistance,
      );
      const cubeTargetLook = new Vector3(
        cubePos[0],
        cubePos[1] + 0.3,
        cubePos[2],
      );

      const smoothT = t * t * (3 - 2 * t);
      position.current.lerp(cubeTargetPos, smoothT);
      target.current.lerp(cubeTargetLook, smoothT);

      const cubeFov = 40;
      const targetEffectiveFov = deskFov + (cubeFov - deskFov) * smoothT;
      const perspectiveCam = activeCamera as { fov?: number; updateProjectionMatrix?: () => void };
      if (perspectiveCam.fov !== undefined && Math.abs(perspectiveCam.fov - targetEffectiveFov) > 0.05) {
        perspectiveCam.fov = targetEffectiveFov;
        perspectiveCam.updateProjectionMatrix?.();
      }
    } else {
      const perspectiveCam = activeCamera as { fov?: number; updateProjectionMatrix?: () => void };
      if (perspectiveCam.fov !== undefined && Math.abs(perspectiveCam.fov - deskFov) > 0.05) {
        perspectiveCam.fov = deskFov;
        perspectiveCam.updateProjectionMatrix?.();
      }
    }

    // In edit mode without preset animation or active transition, release camera to OrbitControls
    if (editing && t === 0 && !isAnimatingPreset.current) {
      controls.current?.update();
      if (controls.current) {
        currentTarget.current.copy(controls.current.target);
      }
      return;
    }

    if (editing && t === 1 && !isAnimatingPreset.current) {
      controls.current?.update();
      return;
    }

    const easing = 1 - Math.exp(-4 * delta);
    activeCamera.position.lerp(position.current, easing);
    if (Math.abs(activeCamera.zoom - deskZoom) > 0.005 && t === 0) {
      activeCamera.zoom = deskZoom;
      activeCamera.updateProjectionMatrix();
    }
    if (controls.current) {
      controls.current.target.lerp(target.current, easing);
      controls.current.update();
      currentTarget.current.copy(controls.current.target);

      if (editing && isAnimatingPreset.current) {
        const distPos = activeCamera.position.distanceTo(position.current);
        const distTarget = controls.current.target.distanceTo(target.current);
        const elapsed = performance.now() - presetStartTime.current;
        if ((distPos < 0.03 && distTarget < 0.03) || elapsed > 800) {
          isAnimatingPreset.current = false;
        }
      }
    } else {
      currentTarget.current.lerp(target.current, easing);
      activeCamera.lookAt(currentTarget.current);
    }

    if (t < 0.5) {
      const activeStep =
        [...stops]
          .reverse()
          .find((stop) => progress + 0.001 >= stop.progress)?.view ?? "overview";
      if (activeStep !== currentStep.current) {
        currentStep.current = activeStep;
        onStep(activeStep);
      }
    }
  });

  return editing ? (
    <OrbitControls
      ref={controls}
      enabled={editing}
      enableDamping
      enableRotate={true}
      enablePan={!cubeViewActive}
      enableZoom={true}
      dampingFactor={0.08}
      minDistance={cubeViewActive ? 0.5 : 0.8}
      maxDistance={cubeViewActive ? 12 : 25}
    />
  ) : null;
}

function RoomScene({
  story,
  onStep,
  onReady,
  configuration,
  targetFov,
  editorOpen,
  selectedObject,
  transformMode,
  transformSpace,
  snapEnabled,
  objectRefs,
  onObjectRef,
  onCubeObjectRef,
  onTransformCommit,
  editorEnabled,
  onSelectedObject,
  animationToken,
  onInformation,
  onFocusObject,
  onAnimation,
  activeAnimations,
  onEmbeddedAnimationsDiscovered,
  cubeStudioActive,
  cubeStudioTargetId,
  cubeStudioProgress,
  onCubeStudioProgress,
  onEnterCubeView,
  editorTab,
  selectedLightItem,
  lightTargetMode,
  onLightPositionCommit,
  onLightTargetCommit,
  onLightRotationCommit,
  manualProgress,
}: {
  story: RefObject<HTMLDivElement | null>;
  onStep: (view: CameraView) => void;
  onReady: () => void;
  configuration: SceneConfiguration;
  targetFov: number;
  editorOpen: boolean;
  selectedObject: string;
  transformMode: TransformMode;
  transformSpace: "world" | "local";
  snapEnabled: boolean;
  objectRefs: { current: Record<string, Group | null> };
  onObjectRef: (id: string, object: Group | null) => void;
  onCubeObjectRef?: (id: string, object: Group | null) => void;
  onTransformCommit: (id: string) => void;
  editorEnabled: boolean;
  onSelectedObject: (id: string) => void;
  animationToken: number;
  onInformation: (title: string, content: string) => void;
  onFocusObject: (objectId: string, duration: number) => void;
  onAnimation: (objectId: string, animation: string, duration: number) => void;
  activeAnimations: Record<string, string>;
  onEmbeddedAnimationsDiscovered: (id: string, clipNames: string[]) => void;
  cubeStudioActive?: boolean;
  cubeStudioTargetId?: string | null;
  cubeStudioProgress?: number;
  onCubeStudioProgress?: (progress: number) => void;
  onEnterCubeView?: (targetObjectId: string, action: SceneInteractionAction) => void;
  editorTab: EditorTab;
  selectedLightItem: SceneLight | null;
  lightTargetMode: "position" | "target";
  onLightPositionCommit: (id: string, newPosition: VectorTuple) => void;
  onLightTargetCommit: (id: string, newTarget: VectorTuple) => void;
  onLightRotationCommit: (id: string, newRotation: VectorTuple) => void;
  manualProgress?: number | null;
}) {
  const bowRef = useRef<Object3D | null>(null);
  const stringsRef = useRef<Object3D | null>(null);
  const handleNamedObjectRef = useCallback((name: string, object: Object3D | null) => {
    if (name === "Bow") bowRef.current = object;
    if (name === "strings1") stringsRef.current = object;
  }, []);

  useEffect(() => onReady(), [onReady]);

  return (
    <>
      <ConfiguredSceneRuntime
        configuration={configuration}
        onObjectRef={onObjectRef}
        onCubeObjectRef={onCubeObjectRef}
        onNamedObjectRef={handleNamedObjectRef}
        activeAnimations={activeAnimations}
        onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
        cubeStudioActive={cubeStudioActive}
        cubeStudioTransitionProgress={cubeStudioProgress ?? 0}
        targetObjectId={cubeStudioTargetId ?? null}
      />
      <SceneTransformGizmo
        active={editorEnabled && editorOpen && editorTab === "objects"}
        object={objectRefs.current[selectedObject]}
        mode={transformMode}
        space={transformSpace}
        snapEnabled={snapEnabled}
        onCommit={() => onTransformCommit(selectedObject)}
      />
      <SceneLightGizmo
        active={editorEnabled && editorOpen && editorTab === "lights" && Boolean(selectedLightItem)}
        light={selectedLightItem}
        mode={transformMode}
        space={transformSpace}
        snapEnabled={snapEnabled}
        lightTargetMode={lightTargetMode}
        onCommitPosition={(newPos) => onLightPositionCommit(selectedLightItem?.id ?? "", newPos)}
        onCommitTarget={(newTarget) => onLightTargetCommit(selectedLightItem?.id ?? "", newTarget)}
        onCommitRotation={(newRot) => onLightRotationCommit(selectedLightItem?.id ?? "", newRot)}
        inCubeStudio={cubeStudioActive}
        cubeStudioPosition={configuration.cubeStudio?.position ?? [0, 80, 0]}
      />
      <CameraMotion
        story={story}
        onStep={onStep}
        cameraStops={configuration.cameraStops}
        targetFov={targetFov}
        editing={editorEnabled && editorOpen}
        cubeViewActive={cubeStudioActive}
        cubeStudioConfig={configuration.cubeStudio}
        onTransitionProgress={onCubeStudioProgress}
        manualProgress={manualProgress}
      />
      <SceneInteractionController
        configuration={configuration}
        editing={editorEnabled && editorOpen}
        objectRefs={objectRefs}
        onSelectedChange={onSelectedObject}
        onInformation={onInformation}
        onFocusObject={onFocusObject}
        onAnimation={onAnimation}
        onEnterCubeView={onEnterCubeView}
      />
      <BowPlayingAnimation
        bow={bowRef}
        strings={stringsRef}
        story={story}
        animationToken={animationToken}
      />
    </>
  );
}

const controls: { id: CameraView | "reset"; label: string }[] = [
  { id: "reset", label: "Overview ↺" },
  { id: "wall", label: "Wall 🧱" },
  { id: "violin", label: "Violin 🎻" },
  { id: "laptop", label: "Laptop 💻" },
  { id: "screen", label: "Screen 🔍" },
];

interface HistoryState {
  past: SceneConfiguration[];
  present: SceneConfiguration;
  future: SceneConfiguration[];
}

type HistoryAction =
  | { type: "set"; configuration: SceneConfiguration }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; configuration: SceneConfiguration };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "set":
      return {
        past: [...state.past.slice(-20), state.present],
        present: action.configuration,
        future: [],
      };
    case "undo":
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    case "redo":
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    case "reset":
      return {
        past: [],
        present: action.configuration,
        future: [],
      };
    default:
      return state;
  }
}

export default function DeskStage() {
  const deviceInfo = useDeviceDetection();
  const [view, setView] = useState<CameraView>("overview");
  const [modelsReady, setModelsReady] = useState(false);
  const story = useRef<HTMLDivElement>(null);
  const sceneContainer = useRef<HTMLDivElement>(null);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const setSceneContainer = useCallback((el: HTMLDivElement | null) => {
    (sceneContainer as { current: HTMLDivElement | null }).current = el;
    setContainerElement(el);
  }, []);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [isStageInViewport, setIsStageInViewport] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false);
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(true);
  const [selectedObject, setSelectedObject] = useState<string>("desk");
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const [transformSpace, setTransformSpace] = useState<"world" | "local">("world");
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [interactionInfo, setInteractionInfo] = useState<{ title: string; content: string } | null>(null);
  const [animationToken, setAnimationToken] = useState(0);
  const [sceneExpanded, setSceneExpanded] = useState(false);

  const [cubeStudioActive, setCubeStudioActive] = useState(false);
  const [cubeStudioTargetId, setCubeStudioTargetId] = useState<string | null>(null);
  const [cubeStudioProgress, setCubeStudioProgress] = useState(0);
  const [cubeStudioLoading, setCubeStudioLoading] = useState(false);

  const [editorTab, setEditorTab] = useState<EditorTab>("objects");
  const [selectedLight, setSelectedLight] = useState<string | null>(null);
  const [lightTargetMode, setLightTargetMode] = useState<"position" | "target">("position");

  const [activeAnimations, setActiveAnimations] = useState<Record<string, string>>({});
  const [embeddedAnimations, setEmbeddedAnimations] = useState<Record<string, string[]>>({});
  const [fullscreenCameraProgress, setFullscreenCameraProgress] = useState<number | null>(null);
  const editorEnabled = true;
  const deskObjectRefs = useRef<Record<string, Group | null>>({});
  const cubeObjectRefs = useRef<Record<string, Group | null>>({});
  const objectRefs = cubeStudioActive ? cubeObjectRefs : deskObjectRefs;

  const [history, dispatchHistory] = useReducer(historyReducer, {
    past: [],
    present: copyDefaultSceneConfiguration(),
    future: [],
  });

  const configuration = history.present;

  const effectiveOrientation = (sceneExpanded || deviceInfo.orientation === "landscape")
    ? "landscape"
    : "portrait";

  const baseConfiguration = configuration.enabled
    ? configuration
    : defaultSceneConfiguration;

  const renderedConfiguration = useMemo(() => {
    return getResponsiveSceneConfiguration(
      baseConfiguration,
      deviceInfo.mode,
      effectiveOrientation
    );
  }, [baseConfiguration, deviceInfo.mode, effectiveOrientation]);

  const targetFov = useMemo(() => {
    return getResponsiveCameraFov(deviceInfo.mode, effectiveOrientation);
  }, [deviceInfo.mode, effectiveOrientation]);

  const activeLightsList = useMemo(() => {
    return cubeStudioActive
      ? (configuration.cubeStudio?.lights ?? [])
      : configuration.lights;
  }, [cubeStudioActive, configuration.cubeStudio?.lights, configuration.lights]);

  const selectedLightItem = useMemo(() => {
    if (!selectedLight) return activeLightsList[0] ?? null;
    return activeLightsList.find((l) => l.id === selectedLight) ?? activeLightsList[0] ?? null;
  }, [activeLightsList, selectedLight]);

  const updateConfiguration = useCallback(
    (updater: (current: SceneConfiguration) => SceneConfiguration) => {
      dispatchHistory({ type: "set", configuration: updater(configuration) });
    },
    [configuration],
  );

  const handleToggleCubeStudio = useCallback(() => {
    if (cubeStudioActive) {
      setCubeStudioLoading(false);
      setCubeStudioActive(false);
      setCubeStudioTargetId(null);
      return;
    }
    const targetId = selectedObject && selectedObject !== "room" ? selectedObject : "androidBug";
    setCubeStudioLoading(true);
    setCubeStudioTargetId(targetId);
    updateConfiguration((current) => {
      const isDeskObject = (id: string) => current.objects.some((deskObj) => deskObj.id === id);
      const nativeCubeObjects = (current.cubeStudio?.objects ?? []).filter(
        (o) => !isDeskObject(o.id) && o.id !== "cube-studio-cat" && o.id !== "androidBug",
      );
      const existingInCube = current.cubeStudio?.objects?.find((o) => o.id === targetId);
      if (existingInCube) {
        return {
          ...current,
          cubeStudio: {
            ...(current.cubeStudio ?? defaultCubeStudio),
            objects: [existingInCube, ...nativeCubeObjects],
          },
        };
      }
      const sourceObj = current.objects.find((o) => o.id === targetId);
      if (!sourceObj) {
        return {
          ...current,
          cubeStudio: {
            ...(current.cubeStudio ?? defaultCubeStudio),
            objects: nativeCubeObjects,
          },
        };
      }
      const cubeObj: SceneObjectInstance = {
        ...sourceObj,
        id: targetId,
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [...sourceObj.transform.scale] as VectorTuple,
        },
      };
      return {
        ...current,
        cubeStudio: {
          ...(current.cubeStudio ?? defaultCubeStudio),
          objects: [cubeObj, ...nativeCubeObjects],
        },
      };
    });
    setTimeout(() => {
      setCubeStudioActive(true);
      setTimeout(() => {
        setCubeStudioLoading(false);
      }, 400);
    }, 180);
  }, [cubeStudioActive, selectedObject, updateConfiguration]);

  const handleLightPositionCommit = useCallback((id: string, newPosition: VectorTuple) => {
    dispatchHistory({
      type: "set",
      configuration: {
        ...configuration,
        cubeStudio: cubeStudioActive && configuration.cubeStudio
          ? {
              ...configuration.cubeStudio,
              lights: configuration.cubeStudio.lights.map((l) =>
                l.id === id && "position" in l ? { ...l, position: newPosition } : l,
              ),
            }
          : configuration.cubeStudio,
        lights: !cubeStudioActive
          ? configuration.lights.map((l) =>
              l.id === id && "position" in l ? { ...l, position: newPosition } : l,
            )
          : configuration.lights,
      },
    });
  }, [configuration, cubeStudioActive]);

  const handleLightTargetCommit = useCallback((id: string, newTarget: VectorTuple) => {
    dispatchHistory({
      type: "set",
      configuration: {
        ...configuration,
        cubeStudio: cubeStudioActive && configuration.cubeStudio
          ? {
              ...configuration.cubeStudio,
              lights: configuration.cubeStudio.lights.map((l) =>
                l.id === id && "target" in l ? { ...l, target: newTarget } : l,
              ),
            }
          : configuration.cubeStudio,
        lights: !cubeStudioActive
          ? configuration.lights.map((l) =>
              l.id === id && "target" in l ? { ...l, target: newTarget } : l,
            )
          : configuration.lights,
      },
    });
  }, [configuration, cubeStudioActive]);

  const handleLightRotationCommit = useCallback((id: string, newRotation: VectorTuple) => {
    dispatchHistory({
      type: "set",
      configuration: {
        ...configuration,
        cubeStudio: cubeStudioActive && configuration.cubeStudio
          ? {
              ...configuration.cubeStudio,
              lights: configuration.cubeStudio.lights.map((l) =>
                l.id === id && "rotation" in l ? { ...l, rotation: newRotation } : l,
              ),
            }
          : configuration.cubeStudio,
        lights: !cubeStudioActive
          ? configuration.lights.map((l) =>
              l.id === id && "rotation" in l ? { ...l, rotation: newRotation } : l,
            )
          : configuration.lights,
      },
    });
  }, [configuration, cubeStudioActive]);

  const handleModelsReady = useCallback(() => {
    setModelsReady(true);
  }, []);

  const registerObject = useCallback((id: string, object: Group | null) => {
    deskObjectRefs.current[id] = object;
  }, []);

  const registerCubeObject = useCallback((id: string, object: Group | null) => {
    cubeObjectRefs.current[id] = object;
  }, []);

  const deleteObject = useCallback(
    (id: string) => {
      if (cubeStudioActive) {
        updateConfiguration((current) => ({
          ...current,
          cubeStudio: current.cubeStudio
            ? {
                ...current.cubeStudio,
                objects: (current.cubeStudio.objects ?? []).filter((item) => item.id !== id),
              }
            : current.cubeStudio,
        }));
      } else {
        updateConfiguration((current) => ({
          ...current,
          objects: current.objects.filter((item) => item.id !== id),
        }));
      }
    },
    [cubeStudioActive, updateConfiguration],
  );

  const updatePlacement = useCallback(
    (id: string, transform: SceneObjectInstance["transform"]) => {
      if (cubeStudioActive) {
        updateConfiguration((current) => ({
          ...current,
          cubeStudio: current.cubeStudio
            ? {
                ...current.cubeStudio,
                objects: (current.cubeStudio.objects ?? []).map((item) =>
                  item.id === id ? { ...item, transform } : item,
                ),
              }
            : current.cubeStudio,
        }));
      } else {
        updateConfiguration((current) => ({
          ...current,
          objects: current.objects.map((item) =>
            item.id === id ? { ...item, transform } : item,
          ),
        }));
      }
    },
    [cubeStudioActive, updateConfiguration],
  );

  const updateCameraStop = useCallback((index: number, stop: SceneCameraStop) => {
    updateConfiguration((current) => ({
      ...current,
      cameraStops: current.cameraStops.map((item, itemIndex) =>
        itemIndex === index ? stop : item,
      ),
    }));
  }, [updateConfiguration]);

  const resetSelectedPlacement = useCallback((id: string) => {
    const original = copyDefaultSceneConfiguration().objects.find(
      (object) => object.id === id,
    );
    updatePlacement(
      id,
      original?.transform ?? {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    );
  }, [updatePlacement]);

  const commitObjectTransform = useCallback((id: string) => {
    const object = objectRefs.current[id];
    if (!object) return;

    updatePlacement(id, {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [
        (object.rotation.x * 180) / Math.PI,
        (object.rotation.y * 180) / Math.PI,
        (object.rotation.z * 180) / Math.PI,
      ],
      scale: [object.scale.x, object.scale.y, object.scale.z],
    });
  }, [objectRefs, updatePlacement]);

  const handleFocusObject = useCallback((objectId: string, duration: number) => {
    const viewByObject: Partial<Record<string, CameraView>> = {
      violin: "violin",
      laptop: "laptop",
    };
    const targetView = viewByObject[objectId];
    if (!targetView) return;
    const stop = renderedConfiguration.cameraStops.find((item) => item.view === targetView);
    if (stop) {
      const element = story.current;
      if (!element) return;
      const distance = Math.max(element.offsetHeight - window.innerHeight, 0);
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().top + distance * stop.progress,
        behavior: duration > 0 ? "smooth" : "auto",
      });
    }
  }, [renderedConfiguration.cameraStops]);

  const handleAnimation = useCallback(
    (objectId: string, animation: string) => {
      const object = renderedConfiguration.objects.find((item) => item.id === objectId);
      if (!object) return;
      const definition = object.animations?.find(
        (item) =>
          item.id === animation ||
          item.name === animation ||
          item.clipName === animation,
      );
      const animationId =
        definition?.id ??
        object.animations?.find((item) => item.name === animation)?.id ??
        object.defaultAnimationId;
      if (animationId) {
        setActiveAnimations((current) => ({ ...current, [objectId]: animationId }));
      }
      setAnimationToken((value) => value + 1);
    },
    [renderedConfiguration.objects],
  );

  const handleEmbeddedAnimationsDiscovered = useCallback((id: string, clipNames: string[]) => {
    setEmbeddedAnimations((current) => {
      if (
        current[id]?.length === clipNames.length &&
        current[id]?.every((name, index) => name === clipNames[index])
      ) {
        return current;
      }
      return { ...current, [id]: clipNames };
    });
  }, []);

  const handleEnterCubeView = useCallback(
    (targetObjectId: string) => {
      setCubeStudioLoading(true);
      setCubeStudioTargetId(targetObjectId);
      setSelectedObject(targetObjectId);

      updateConfiguration((current) => {
        const isDeskObject = (id: string) => current.objects.some((deskObj) => deskObj.id === id);
        // Clean out any previously ported desk objects so objects don't overlap at [0, 0, 0]
        const nativeCubeObjects = (current.cubeStudio?.objects ?? []).filter(
          (o) => !isDeskObject(o.id) && o.id !== "cube-studio-cat" && o.id !== "androidBug",
        );

        const existingInCube = current.cubeStudio?.objects?.find((o) => o.id === targetObjectId);
        if (existingInCube) {
          return {
            ...current,
            cubeStudio: {
              ...(current.cubeStudio ?? defaultCubeStudio),
              objects: [existingInCube, ...nativeCubeObjects],
            },
          };
        }

        const sourceObj = current.objects.find((o) => o.id === targetObjectId);
        if (!sourceObj) {
          return {
            ...current,
            cubeStudio: {
              ...(current.cubeStudio ?? defaultCubeStudio),
              objects: nativeCubeObjects,
            },
          };
        }

        const cubeObj: SceneObjectInstance = {
          ...sourceObj,
          id: targetObjectId,
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [...sourceObj.transform.scale] as VectorTuple,
          },
        };

        return {
          ...current,
          cubeStudio: {
            ...(current.cubeStudio ?? defaultCubeStudio),
            objects: [cubeObj, ...nativeCubeObjects],
          },
        };
      });

      setTimeout(() => {
        setCubeStudioActive(true);
        setTimeout(() => {
          setCubeStudioLoading(false);
        }, 400);
      }, 180);
    },
    [updateConfiguration],
  );

  const handleExitCubeView = useCallback(() => {
    setCubeStudioActive(false);
    setCubeStudioTargetId(null);
  }, []);

  const handleEnterFullscreen = useCallback(async () => {
    setSceneExpanded(true);
    const storyElement = story.current;
    let initialProgress: number | null = null;
    if (storyElement) {
      const distance = Math.max(storyElement.offsetHeight - window.innerHeight, 0);
      const scroll = Math.max(0, -storyElement.getBoundingClientRect().top);
      initialProgress = distance > 0 ? Math.min(1, Math.max(0, scroll / distance)) : 0;
    }
    setFullscreenCameraProgress(initialProgress);
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-scene-fullscreen", "true");
      window.dispatchEvent(
        new CustomEvent("portfolio:scene-fullscreen", { detail: { active: true } })
      );
    }

    const doc = typeof document !== "undefined" ? (document as ExtendedDocument) : null;
    const elem = sceneContainer.current as ExtendedHTMLElement | null;
    if (elem && doc) {
      const isFsSupported = Boolean(
        doc.fullscreenEnabled ||
          doc.webkitFullscreenEnabled ||
          doc.mozFullScreenEnabled ||
          doc.msFullscreenEnabled
      );

      if (isFsSupported) {
        const reqFs =
          elem.requestFullscreen ||
          elem.webkitRequestFullscreen ||
          elem.mozRequestFullScreen ||
          elem.msRequestFullscreen;
        if (reqFs) {
          try {
            await reqFs.call(elem);
          } catch (err) {
            console.warn("Fullscreen request error, falling back to CSS fullscreen:", err);
          }
        }
      }
    }

    // Attempt locking screen orientation to landscape on mobile devices (e.g. Android Chrome)
    const orientationObj =
      typeof window !== "undefined"
        ? (window.screen?.orientation as ExtendedScreenOrientation | undefined)
        : undefined;
    if (orientationObj && typeof orientationObj.lock === "function") {
      try {
        await orientationObj.lock("landscape");
      } catch {
        // Graceful fallback if orientation locking is not permitted
      }
    }
  }, []);

  const handleExitFullscreen = useCallback(async () => {
    setSceneExpanded(false);
    setFullscreenCameraProgress(null);
    setCameraDropdownOpen(false);
    if (deviceInfo.isTouch || deviceInfo.mode !== "desktop") {
      setEditorOpen(false);
    }
    const doc = typeof document !== "undefined" ? (document as ExtendedDocument) : null;
    if (doc) {
      doc.body.removeAttribute("data-scene-fullscreen");
      window.dispatchEvent(
        new CustomEvent("portfolio:scene-fullscreen", { detail: { active: false } })
      );

      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        const exitFs =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.mozCancelFullScreen ||
          doc.msExitFullscreen;
        if (exitFs) {
          try {
            await exitFs.call(doc);
          } catch {}
        }
      }
    }

    const orientationObj =
      typeof window !== "undefined"
        ? (window.screen?.orientation as ExtendedScreenOrientation | undefined)
        : undefined;
    if (orientationObj && typeof orientationObj.unlock === "function") {
      try {
        orientationObj.unlock();
      } catch {}
    }
  }, [deviceInfo.isTouch, deviceInfo.mode]);

  useEffect(() => {
    const handleFsChange = () => {
      const doc = typeof document !== "undefined" ? (document as ExtendedDocument) : null;
      const isCurrentlyFullscreen = Boolean(
        doc?.fullscreenElement || doc?.webkitFullscreenElement
      );
      if (!isCurrentlyFullscreen && sceneExpanded) {
        setSceneExpanded(false);
        setFullscreenCameraProgress(null);
        setCameraDropdownOpen(false);
        if (deviceInfo.isTouch || deviceInfo.mode !== "desktop") {
          setEditorOpen(false);
        }
        doc?.body.removeAttribute("data-scene-fullscreen");
        window.dispatchEvent(
          new CustomEvent("portfolio:scene-fullscreen", { detail: { active: false } })
        );
        const orientationObj =
          typeof window !== "undefined"
            ? (window.screen?.orientation as ExtendedScreenOrientation | undefined)
            : undefined;
        if (orientationObj && typeof orientationObj.unlock === "function") {
          try {
            orientationObj.unlock();
          } catch {}
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-scene-fullscreen");
      }
    };
  }, [sceneExpanded, deviceInfo.isTouch, deviceInfo.mode]);

  const scrollToProgress = useCallback((progress: number) => {
    const element = story.current;
    if (!element) return;

    const distance = Math.max(element.offsetHeight - window.innerHeight, 0);
    window.scrollTo({
      top: window.scrollY + element.getBoundingClientRect().top + distance * progress,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const container = sceneContainer.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "350px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stageEl = document.getElementById("desk-stage");
    if (!stageEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStageInViewport(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "100px 0px 100px 0px" }
    );

    observer.observe(stageEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = sceneContainer.current;
    if (!container) return;
    const canvas = container.querySelector("canvas");
    if (!canvas) return;

    if (editorOpen || sceneExpanded) {
      canvas.style.touchAction = "none";
    } else {
      canvas.style.touchAction = "pan-y";
    }
  }, [editorOpen, sceneExpanded, sceneVisible, modelsReady]);

  return (
    <section
      className="w-full bg-surface-container-lowest py-space-xl px-0 sm:px-gutter-mobile lg:px-gutter"
      id="desk-stage"
      data-editing={editorOpen ? "true" : "false"}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="relative min-h-[300vh]" ref={story}>
          <div className="sticky top-3 flex h-[calc(100vh-1.5rem)] min-h-[520px] flex-col gap-space-sm">
            <div className="px-gutter-mobile sm:px-0 flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-tertiary rounded-full"></span>
                  <span className="font-label-code-sm text-xs sm:text-label-code-sm text-tertiary uppercase tracking-widest font-bold">
                    Scroll-Driven 3D Desk
                  </span>
                </div>
                <h2 className="font-headline-sm sm:font-headline-md md:font-headline-lg text-lg sm:text-2xl md:text-headline-lg font-bold text-on-surface mt-1 leading-snug">
                  Malay&apos;s Work Desk Simulator
                </h2>
              </div>
              <div className="hidden bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-surface-variant md:block">
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                  Three.js &amp; R3F Scene Engine // Ready
                </span>
              </div>
            </div>

            <div
              className={
                sceneExpanded
                  ? "fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-surface-container-low"
                  : "relative min-h-0 flex-1 w-full rounded-none sm:rounded-2xl bg-surface-container-low border-y-2 sm:border-2 border-surface-variant shadow-none sm:shadow-[6px_6px_0px_#080d22] overflow-hidden"
              }
              ref={setSceneContainer}
              data-expanded={sceneExpanded ? "true" : "false"}
            >
              <DeskSceneSkeleton
                loading={!sceneVisible || !modelsReady}
                onRetry={() => {
                  setSceneVisible(true);
                  setModelsReady(true);
                }}
              />

              {sceneVisible && (
                <div data-canvas-wrapper="true" className="w-full h-full">
                  <Canvas
                    style={{
                      touchAction: sceneExpanded || editorOpen ? "none" : "pan-y",
                    }}
                    className={sceneExpanded || editorOpen ? "touch-none" : "touch-pan-y"}
                    dpr={[1, Math.max(1, renderedConfiguration.environment.pixelRatioCap)]}
                    shadows={renderedConfiguration.environment.shadows}
                    camera={{
                      position: renderedConfiguration.cameraStops[0].position,
                      fov: targetFov,
                      near: 0.1,
                      far: 100,
                    }}
                    gl={{ antialias: true, alpha: false }}
                  >
                    <Suspense fallback={null}>
                      <RoomScene
                        story={story}
                        onStep={setView}
                        onReady={handleModelsReady}
                        configuration={renderedConfiguration}
                        targetFov={targetFov}
                        editorOpen={editorOpen}
                        selectedObject={selectedObject}
                        transformMode={transformMode}
                        transformSpace={transformSpace}
                        snapEnabled={snapEnabled}
                        objectRefs={objectRefs}
                        onObjectRef={registerObject}
                        onCubeObjectRef={registerCubeObject}
                        onTransformCommit={commitObjectTransform}
                        editorEnabled={editorEnabled}
                        onSelectedObject={setSelectedObject}
                        animationToken={animationToken}
                        onInformation={(title, content) => setInteractionInfo({ title, content })}
                        onFocusObject={handleFocusObject}
                        onAnimation={handleAnimation}
                        activeAnimations={activeAnimations}
                        onEmbeddedAnimationsDiscovered={handleEmbeddedAnimationsDiscovered}
                        cubeStudioActive={cubeStudioActive}
                        cubeStudioTargetId={cubeStudioTargetId || (selectedObject !== "room" ? selectedObject : null)}
                        cubeStudioProgress={cubeStudioProgress}
                        onCubeStudioProgress={setCubeStudioProgress}
                        onEnterCubeView={handleEnterCubeView}
                        editorTab={editorTab}
                        selectedLightItem={selectedLightItem}
                        lightTargetMode={lightTargetMode}
                        onLightPositionCommit={handleLightPositionCommit}
                        onLightTargetCommit={handleLightTargetCommit}
                        onLightRotationCommit={handleLightRotationCommit}
                        manualProgress={fullscreenCameraProgress}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              )}

              {/* Studio View Transition Loading Overlay */}
              <div
                aria-live="polite"
                className={`pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-surface-container-lowest/85 backdrop-blur-md transition-opacity duration-500 ${
                  cubeStudioLoading ? "opacity-100 pointer-events-auto" : "opacity-0"
                }`}
              >
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-surface-variant bg-surface-container-lowest p-6 shadow-[6px_6px_0px_#080d22]">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-surface-container-high border-t-primary" />
                    <span className="material-symbols-outlined text-2xl text-primary" aria-hidden="true">
                      view_in_ar
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-on-surface">Entering Studio View…</p>
                    <p className="mt-0.5 font-label-code-sm text-label-code-sm text-on-surface-variant">
                      Preparing 3D environment &amp; lighting
                    </p>
                  </div>
                </div>
              </div>

              {/* Exit Cube View Button - returns back to desk scene */}
              {(cubeStudioActive || cubeStudioProgress > 0.05) && (
                <button
                  aria-label="Exit Cube View"
                  onClick={handleExitCubeView}
                  className="absolute top-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-container-lowest/90 text-on-surface shadow-[4px_4px_0px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-surface-container-high active:scale-95 cursor-pointer"
                  type="button"
                  title="Return to Desk Scene View"
                >
                  <span className="material-symbols-outlined text-2xl font-bold" aria-hidden="true">close</span>
                </button>
              )}

              {/* Fullscreen Top Controls Bar (Edit Scene + Exit Fullscreen) */}
              {sceneExpanded && (
                <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2">
                  {editorEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !editorOpen;
                        setEditorOpen(next);
                        if (next) {
                          setSettingsPanelVisible(true);
                        } else {
                          setCameraDropdownOpen(false);
                        }
                      }}
                      className={`flex h-11 items-center gap-1.5 sm:gap-2 rounded-xl border-2 px-3 sm:px-3.5 py-2 font-label-code-sm text-xs font-bold shadow-[3px_3px_0px_#080d22] backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                        editorOpen
                          ? "border-primary bg-primary text-on-primary"
                          : "border-surface-variant bg-surface-container-lowest/95 text-on-surface hover:bg-surface-container-high"
                      }`}
                      title={editorOpen ? "Close Scene Editor" : "Open Scene Editor"}
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">
                        {editorOpen ? "close" : "tune"}
                      </span>
                      <span>{editorOpen ? "Close editor" : "Edit scene"}</span>
                    </button>
                  )}

                  {!cubeStudioActive && cubeStudioProgress <= 0.05 && (
                    <button
                      aria-label="Exit Fullscreen 3D View"
                      onClick={handleExitFullscreen}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-outline-variant bg-surface-container-lowest/95 text-on-surface shadow-[3px_3px_0px_#080d22] backdrop-blur-md transition-all hover:border-primary hover:bg-surface-container-high active:scale-95 cursor-pointer"
                      type="button"
                      title="Exit Fullscreen 3D View"
                    >
                      <span className="material-symbols-outlined text-2xl font-bold" aria-hidden="true">
                        close
                      </span>
                    </button>
                  )}
                </div>
              )}

              {!sceneExpanded && !cubeStudioActive && cubeStudioProgress <= 0.05 && (
                <div className="absolute bottom-3 left-3 sm:left-auto sm:right-4 sm:bottom-4 z-30 flex flex-col items-start sm:items-end gap-2 pr-0 sm:pr-20">
                  {/* Top helper pill matching reference */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/90 border border-surface-variant backdrop-blur-md shadow-[2px_2px_0px_#080d22] text-on-surface font-label-code-sm text-[11px] sm:text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>
                      {deviceInfo.isTouch
                        ? "Scroll to explore · Tap objects to interact"
                        : "Scroll to explore · Click objects to interact"}
                    </span>
                  </div>

                  {/* Buttons row matching reference */}
                  <div className="flex items-center gap-2">
                    {/* On mobile device, edit mode is restricted to fullscreen only. Desktop users can edit in normal or fullscreen mode */}
                    {editorEnabled && (!deviceInfo.isTouch && deviceInfo.mode === "desktop") && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = !editorOpen;
                          setEditorOpen(next);
                          if (next) setSettingsPanelVisible(true);
                        }}
                        className={`flex h-10 sm:h-11 items-center gap-2 rounded-xl border-2 px-3 sm:px-3.5 py-2 font-label-code-sm text-xs sm:text-sm font-bold shadow-[3px_3px_0px_#080d22] backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                          editorOpen
                            ? "border-primary bg-primary text-on-primary"
                            : "border-surface-variant bg-surface-container-high/95 text-on-surface hover:bg-surface-container-highest"
                        }`}
                        title={editorOpen ? "Close Scene Editor" : "Open Scene Editor"}
                      >
                        <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">
                          {editorOpen ? "close" : "tune"}
                        </span>
                        <span>{editorOpen ? "Close editor" : "Edit scene"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleEnterFullscreen}
                      className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border-2 border-surface-variant bg-surface-container-high/95 px-3 sm:px-3.5 py-2 font-label-code-sm text-xs sm:text-sm font-bold text-on-surface shadow-[3px_3px_0px_#080d22] backdrop-blur-md transition-all hover:bg-surface-container-highest active:scale-95 cursor-pointer"
                      title="Expand to Fullscreen View"
                    >
                      <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">
                        crop_free
                      </span>
                      <span>Widescreen</span>
                    </button>
                  </div>
                </div>
              )}

              {interactionInfo && (
                <div className="absolute bottom-3 left-1/2 z-30 w-[min(24rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-xl border-2 border-surface-variant bg-surface-container-lowest p-4 shadow-[4px_4px_0px_#080d22]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-on-surface">{interactionInfo.title}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{interactionInfo.content}</p>
                    </div>
                    <button
                      aria-label="Close information"
                      className="material-symbols-outlined text-xl text-on-surface cursor-pointer"
                      onClick={() => setInteractionInfo(null)}
                      type="button"
                    >
                      close
                    </button>
                  </div>
                </div>
              )}

              {editorEnabled && sceneVisible && modelsReady && (sceneExpanded || (!deviceInfo.isTouch && deviceInfo.mode === "desktop")) && (
                <DeskSceneEditor
                  container={containerElement}
                  open={editorOpen && settingsPanelVisible}
                  onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                      setSettingsPanelVisible(false);
                    } else {
                      setEditorOpen(true);
                      setSettingsPanelVisible(true);
                    }
                  }}
                  selected={selectedObject}
                  onSelectedChange={setSelectedObject}
                  mode={transformMode}
                  onModeChange={setTransformMode}
                  transformSpace={transformSpace}
                  onTransformSpaceChange={setTransformSpace}
                  snapEnabled={snapEnabled}
                  onSnapEnabledChange={setSnapEnabled}
                  configuration={configuration}
                  onConfigurationChange={updateConfiguration}
                  onPlacementChange={updatePlacement}
                  onCameraStopChange={updateCameraStop}
                  onResetSelected={resetSelectedPlacement}
                  onDeleteObject={deleteObject}
                  onResetAll={() => {
                    dispatchHistory({
                      type: "reset",
                      configuration: copyDefaultSceneConfiguration(),
                    });
                    setSelectedObject("desk");
                  }}
                  onUndo={() => dispatchHistory({ type: "undo" })}
                  onRedo={() => dispatchHistory({ type: "redo" })}
                  canUndo={history.past.length > 0}
                  canRedo={history.future.length > 0}
                  expanded={sceneExpanded}
                  onExpandedChange={setSceneExpanded}
                  embeddedAnimations={embeddedAnimations}
                  cubeStudioActive={cubeStudioActive}
                  onToggleCubeStudio={handleToggleCubeStudio}
                  cubeStudioTargetId={cubeStudioTargetId || (selectedObject !== "room" ? selectedObject : null)}
                  tab={editorTab}
                  onTabChange={setEditorTab}
                  selectedLight={selectedLight ?? undefined}
                  onSelectedLightChange={setSelectedLight}
                  lightTargetMode={lightTargetMode}
                  onLightTargetModeChange={setLightTargetMode}
                  isStageVisible={isStageInViewport}
                />
              )}

              {/* Camera preset controls - available in normal mode, and in fullscreen (split by non-edit vs edit mode) */}
              {sceneExpanded ? (
                editorOpen ? (
                  /* Fullscreen Edit Mode Bottom Toolbar: Dropdown + Settings Panel Toggle */
                  <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-lowest/95 border-2 border-surface-variant backdrop-blur-md shadow-[4px_4px_0px_#080d22]">
                    {/* Combined camera preset dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        aria-expanded={cameraDropdownOpen}
                        onClick={() => setCameraDropdownOpen((prev) => !prev)}
                        className="flex h-10 items-center gap-1.5 sm:gap-2 rounded-xl border-2 border-outline-variant bg-surface-container-high/95 px-3 py-1.5 font-label-code-sm text-xs font-bold text-on-surface shadow-[2px_2px_0px_#080d22] transition-colors hover:bg-surface-container-highest active:scale-95 cursor-pointer whitespace-nowrap"
                        title="Select camera preset position"
                      >
                        <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">videocam</span>
                        <span>{controls.find((c) => (c.id === "reset" ? view === "overview" : view === c.id))?.label ?? "Overview ↺"}</span>
                        <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform duration-200 ${cameraDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true">
                          expand_more
                        </span>
                      </button>

                      {cameraDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-2 flex min-w-[170px] flex-col gap-1 rounded-xl border-2 border-surface-variant bg-surface-container-lowest p-1.5 shadow-[4px_4px_0px_#080d22] z-50">
                          {controls.map(({ id, label }) => {
                            const active = id === "reset" ? view === "overview" : view === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-label-code-sm text-xs transition-colors cursor-pointer ${
                                  active
                                    ? "bg-primary-container text-on-primary-container font-bold"
                                    : "text-on-surface hover:bg-surface-container-high"
                                }`}
                                onClick={() => {
                                  const targetProgress =
                                    id === "reset"
                                      ? 0
                                      : renderedConfiguration.cameraStops.find((stop) => stop.view === id)?.progress ??
                                        cameraProgress[id];
                                  setFullscreenCameraProgress(targetProgress);
                                  setView(id === "reset" ? "overview" : id);
                                  setCameraDropdownOpen(false);
                                }}
                              >
                                <span>{label}</span>
                                {active && (
                                  <span className="material-symbols-outlined text-sm font-bold" aria-hidden="true">check</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Settings Panel Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setSettingsPanelVisible((prev) => !prev)}
                      className={`flex h-10 items-center gap-1.5 sm:gap-2 rounded-xl border-2 px-3 py-1.5 font-label-code-sm text-xs font-bold shadow-[2px_2px_0px_#080d22] transition-colors active:scale-95 cursor-pointer whitespace-nowrap ${
                        settingsPanelVisible
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant bg-surface-container-high/95 text-on-surface hover:bg-surface-container-highest"
                      }`}
                      title={settingsPanelVisible ? "Hide scene settings panel" : "Show scene settings panel"}
                    >
                      <span className="material-symbols-outlined text-base" aria-hidden="true">tune</span>
                      <span>{settingsPanelVisible ? "Hide panel" : "Settings panel"}</span>
                    </button>
                  </div>
                ) : (
                  /* Fullscreen Non-Edit Mode Bottom Toolbar: Horizontal Pill Bar with 5 Buttons */
                  <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-container-lowest/95 border-2 border-surface-variant backdrop-blur-md shadow-[4px_4px_0px_#080d22] max-w-[calc(100%-2rem)] overflow-x-auto no-scrollbar">
                    {controls.map(({ id, label }) => {
                      const active = id === "reset" ? view === "overview" : view === id;
                      return (
                        <button
                          aria-pressed={active}
                          className={`rounded-xl border px-3 py-1.5 font-label-code-sm text-xs whitespace-nowrap shadow-[2px_2px_0px_#080d22] transition-colors touch-manipulation cursor-pointer ${
                            active
                              ? "border-surface-container-lowest bg-primary-container font-bold text-on-primary-container"
                              : "border-outline-variant bg-surface-container-lowest/95 text-on-surface hover:bg-surface-container-high"
                          }`}
                          key={id}
                          onClick={() => {
                            const targetProgress =
                              id === "reset"
                                ? 0
                                : renderedConfiguration.cameraStops.find((stop) => stop.view === id)?.progress ??
                                  cameraProgress[id];
                            setFullscreenCameraProgress(targetProgress);
                            setView(id === "reset" ? "overview" : id);
                          }}
                          type="button"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="absolute left-2 right-2 top-2 z-20 flex flex-wrap items-center gap-1.5 sm:left-5 sm:right-5 sm:top-5 sm:gap-2">
                  {controls.map(({ id, label }) => {
                    const active = id === "reset" ? view === "overview" : view === id;
                    return (
                      <button
                        aria-pressed={active}
                        className={`rounded-lg border px-2 py-1 sm:px-3 sm:py-2 font-label-code-sm text-[11px] sm:text-xs shadow-[2px_2px_0px_#080d22] transition-colors touch-manipulation min-h-[32px] sm:min-h-0 cursor-pointer ${
                          active
                            ? "border-surface-container-lowest bg-primary-container font-bold text-on-primary-container"
                            : "border-outline-variant bg-surface-container-lowest/95 text-on-surface hover:bg-surface-container-high"
                        }`}
                        key={id}
                        onClick={() =>
                          scrollToProgress(
                            id === "reset"
                              ? 0
                              : renderedConfiguration.cameraStops.find((stop) => stop.view === id)?.progress ??
                                cameraProgress[id],
                          )
                        }
                        type="button"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-gutter-mobile sm:px-0 flex items-center justify-between gap-space-sm pb-1">
              <span className="font-label-code-sm text-xs sm:text-label-code-sm text-on-surface-variant">
                {view === "overview" && "A quiet corner, ready for a closer look."}
                {view === "wall" && "Wall showcase with technical milestones & logos."}
                {view === "violin" && "Exploring the creative studio workspace."}
                {view === "laptop" && "Moving in toward the laptop."}
                {view === "screen" && "A closer look at the laptop screen."}
              </span>
              <span className="font-label-code-sm text-xs sm:text-label-code-sm text-tertiary">
                {Math.round(
                  (renderedConfiguration.cameraStops.find((stop) => stop.view === view)?.progress ??
                    cameraProgress[view]) * 100
                )}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
