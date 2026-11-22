"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
}: {
  story: RefObject<HTMLDivElement | null>;
  onStep: (view: CameraView) => void;
  cameraStops: SceneCameraStop[];
  targetFov?: number;
  editing?: boolean;
  cubeViewActive?: boolean;
  cubeStudioConfig?: CubeStudioConfiguration;
  onTransitionProgress?: (progress: number) => void;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const nextPosition = useRef(new Vector3());
  const nextTarget = useRef(new Vector3());
  const currentStep = useRef<CameraView>("overview");
  const transitionRef = useRef({ progress: 0, fromActive: false });

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
    const progress = distance > 0 ? Math.min(1, Math.max(0, scroll / distance)) : 0;

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

    const easing = 1 - Math.exp(-4 * delta);
    activeCamera.position.lerp(position.current, easing);
    if (Math.abs(activeCamera.zoom - deskZoom) > 0.005 && t === 0) {
      activeCamera.zoom = deskZoom;
      activeCamera.updateProjectionMatrix();
    }
    controls.current?.target.lerp(target.current, easing);
    controls.current?.update();

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

  return (
    <OrbitControls
      ref={controls}
      enabled={editing}
      enableDamping
      enableRotate={editing && !cubeViewActive}
      enablePan={editing && !cubeViewActive}
      enableZoom={editing}
      dampingFactor={0.08}
      minDistance={cubeViewActive ? 0.5 : 1.5}
      maxDistance={cubeViewActive ? 40 : 20}
    />
  );
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
  const [sceneVisible, setSceneVisible] = useState(false);
  const [isStageInViewport, setIsStageInViewport] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
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
  const editorEnabled = process.env.NODE_ENV === "development";
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

  return (
    <section
      className="w-full bg-surface-container-lowest py-space-xl px-gutter-mobile lg:px-gutter"
      id="desk-stage"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="relative min-h-[300vh]" ref={story}>
          <div className="sticky top-3 flex h-[calc(100vh-1.5rem)] min-h-[520px] flex-col gap-space-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-tertiary rounded-full"></span>
                  <span className="font-label-code-sm text-label-code-sm text-tertiary uppercase tracking-widest">
                    Scroll-Driven 3D Desk
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
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
                  ? "fixed inset-0 z-[70] h-screen w-screen overflow-hidden bg-surface-container-low"
                  : "relative min-h-0 flex-1 w-full rounded-2xl bg-surface-container-low border-2 border-surface-variant shadow-[6px_6px_0px_#080d22] overflow-hidden"
              }
              ref={sceneContainer}
            >
              <DeskSceneSkeleton
                loading={!sceneVisible || !modelsReady}
                onRetry={() => {
                  setSceneVisible(true);
                  setModelsReady(true);
                }}
              />

              {sceneVisible && (
                <Canvas
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
                    />
                  </Suspense>
                </Canvas>
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

              {/* Exit Fullscreen 3D View Button */}
              {sceneExpanded && !cubeStudioActive && cubeStudioProgress <= 0.05 && (
                <button
                  aria-label="Exit Fullscreen 3D View"
                  onClick={() => setSceneExpanded(false)}
                  className="absolute top-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-container-lowest/90 text-on-surface shadow-[4px_4px_0px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-surface-container-high active:scale-95 cursor-pointer"
                  type="button"
                  title="Exit Fullscreen 3D View"
                >
                  <span className="material-symbols-outlined text-2xl font-bold" aria-hidden="true">close</span>
                </button>
              )}

              {sceneExpanded && deviceInfo.isMobilePortrait && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border-2 border-primary/50 bg-surface-container-lowest/95 px-4 py-2 font-label-code-sm text-xs text-on-surface shadow-[4px_4px_0px_#080d22] backdrop-blur-md animate-pulse pointer-events-none whitespace-nowrap">
                  <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">screen_rotation</span>
                  <span>Rotate phone horizontally for wide view</span>
                </div>
              )}

              {!sceneExpanded && !cubeStudioActive && cubeStudioProgress <= 0.05 && (
                <button
                  type="button"
                  onClick={() => setSceneExpanded(true)}
                  className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-xl border-2 border-surface-variant bg-surface-container-lowest/95 px-3 py-2 font-label-code-sm text-xs font-bold text-on-surface shadow-[3px_3px_0px_#080d22] backdrop-blur-md transition-all hover:bg-surface-container-high active:scale-95 cursor-pointer md:hidden"
                  title="Expand to Fullscreen Horizontal View"
                >
                  <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">screen_rotation</span>
                  <span>Widescreen ⛶</span>
                </button>
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

              {editorEnabled && sceneVisible && modelsReady && (
                <DeskSceneEditor
                  open={editorOpen}
                  onOpenChange={setEditorOpen}
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
                  isMobilePortrait={deviceInfo.isMobilePortrait}
                />
              )}

              {view !== "screen" && (
                <>
                  <div className="absolute left-3 right-3 top-3 z-20 flex flex-wrap items-center gap-2 sm:left-5 sm:right-5 sm:top-5">
                    {controls.map(({ id, label }) => {
                      const active = id === "reset" ? view === "overview" : view === id;
                      return (
                        <button
                          aria-pressed={active}
                          className={`rounded-lg border-2 px-2.5 py-1.5 sm:px-3 sm:py-2 font-label-code-sm text-xs sm:text-label-code-sm shadow-[2px_2px_0px_#080d22] transition-colors touch-manipulation min-h-[38px] sm:min-h-0 cursor-pointer ${
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
                  <div className="absolute bottom-3 left-3 z-20 rounded-lg border border-surface-variant bg-surface-container-lowest/90 px-3 py-2 font-label-code-sm text-xs sm:text-label-code-sm text-on-surface-variant backdrop-blur-md sm:bottom-5 sm:left-5">
                    {deviceInfo.isTouch
                      ? "Scroll to explore · Tap objects to interact"
                      : "Scroll to explore · Click objects to interact"}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-space-sm pb-1">
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                {view === "overview" && "A quiet corner, ready for a closer look."}
                {view === "violin" && "Exploring the creative studio workspace."}
                {view === "laptop" && "Moving in toward the laptop."}
                {view === "screen" && "A closer look at the laptop screen."}
              </span>
              <span className="font-label-code-sm text-label-code-sm text-tertiary">
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
