"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DeskSceneEditor, SceneTransformGizmo } from "../three/DeskSceneEditor";
import { type TransformMode } from "../three/deskSceneLayout";
import {
  copyDefaultSceneConfiguration,
  defaultSceneConfiguration,
  cameraProgress,
} from "../three/config/defaultScene";
import type { CameraView, SceneCameraStop, SceneConfiguration } from "../three/config/sceneTypes";
import { ConfiguredSceneRuntime } from "../three/runtime/ConfiguredSceneRuntime";
import { SceneInteractionController } from "../three/runtime/SceneInteractionController";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useReducer,
  type ComponentRef,
  type RefObject,
} from "react";
import { Box3, Vector3, type Object3D, type Group } from "three";

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

    // The Bow node is fitted with the rest of the GLB, so these are local offsets.
    bowObject.position.set(
      basePosition.current.x + stroke * 0.24,
      basePosition.current.y + returnStroke * 0.006,
      basePosition.current.z + returnStroke * 0.008,
    );
    bowObject.rotation.set(
      baseRotation.current.x + returnStroke * 0.012,
      baseRotation.current.y + stroke * 0.018,
      baseRotation.current.z + stroke * 0.028,
    );
  });

  return null;
}

function CameraMotion({
  story,
  onStep,
  cameraStops,
  editing,
}: {
  story: RefObject<HTMLDivElement | null>;
  onStep: (view: CameraView) => void;
  cameraStops: SceneCameraStop[];
  editing: boolean;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const currentStep = useRef<CameraView | null>(null);
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const nextPosition = useRef(new Vector3());
  const nextTarget = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    if (editing) {
      controls.current?.update();
      return;
    }
    const element = story.current;
    if (!element) return;

    const scrollLength = Math.max(element.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(
      0,
      Math.min(1, -element.getBoundingClientRect().top / scrollLength),
    );
    const stops = [...cameraStops].sort((a, b) => a.progress - b.progress);
    const nextStopIndex = stops.findIndex((stop) => stop.progress >= progress);
    const start = stops[Math.max(0, nextStopIndex - 1)];
    const end = stops[nextStopIndex < 0 ? stops.length - 1 : nextStopIndex];
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

    const easing = 1 - Math.exp(-4 * delta);
    camera.position.lerp(position.current, easing);
    const zoom = 1 + 1.1 * Math.max(0, Math.min(1, (progress - 0.72) / 0.28));
    if (Math.abs(camera.zoom - zoom) > 0.005) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
    controls.current?.target.lerp(target.current, easing);
    controls.current?.update();

    const activeStep =
      [...stops]
        .reverse()
        .find((stop) => progress + 0.001 >= stop.progress)?.view ?? "overview";
    if (activeStep !== currentStep.current) {
      currentStep.current = activeStep;
      onStep(activeStep);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      enableRotate={editing}
      enablePan={editing}
      enableZoom={editing}
      dampingFactor={0.08}
      // maxDistance={14}
      minDistance={1.5}
    // maxPolarAngle={Math.PI * 0.43}
    />
  );
}

function RoomScene({
  story,
  onStep,
  onReady,
  configuration,
  editorOpen,
  selectedObject,
  transformMode,
  transformSpace,
  snapEnabled,
  objectRefs,
  onObjectRef,
  onTransformCommit,
  editorEnabled,
  onSelectedObject,
  animationToken,
  onInformation,
  onFocusObject,
  onAnimation,
  activeAnimations,
  onEmbeddedAnimationsDiscovered,
}: {
  story: RefObject<HTMLDivElement | null>;
  onStep: (view: CameraView) => void;
  onReady: () => void;
  configuration: SceneConfiguration;
  editorOpen: boolean;
  selectedObject: string;
  transformMode: TransformMode;
  transformSpace: "world" | "local";
  snapEnabled: boolean;
  objectRefs: { current: Record<string, Group | null> };
  onObjectRef: (id: string, object: Group | null) => void;
  onTransformCommit: (id: string) => void;
  editorEnabled: boolean;
  onSelectedObject: (id: string) => void;
  animationToken: number;
  onInformation: (title: string, content: string) => void;
  onFocusObject: (objectId: string, duration: number) => void;
  onAnimation: (objectId: string, animation: string, duration: number) => void;
  activeAnimations: Record<string, string>;
  onEmbeddedAnimationsDiscovered: (id: string, clipNames: string[]) => void;
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
        onNamedObjectRef={handleNamedObjectRef}
        activeAnimations={activeAnimations}
        onEmbeddedAnimationsDiscovered={onEmbeddedAnimationsDiscovered}
      />
      <BowPlayingAnimation
        bow={bowRef}
        strings={stringsRef}
        story={story}
        animationToken={animationToken}
      />
      <SceneTransformGizmo
        active={editorEnabled && editorOpen}
        object={objectRefs.current[selectedObject]}
        mode={transformMode}
        space={transformSpace}
        snapEnabled={snapEnabled}
        onCommit={() => onTransformCommit(selectedObject)}
      />
      <CameraMotion
        story={story}
        onStep={onStep}
        cameraStops={configuration.cameraStops}
        editing={editorEnabled && editorOpen}
      />
      <SceneInteractionController
        configuration={configuration}
        editing={editorEnabled && editorOpen}
        objectRefs={objectRefs}
        onSelectedChange={onSelectedObject}
        onInformation={onInformation}
        onAnimation={onAnimation}
        onFocusObject={onFocusObject}
      />
      {editorOpen && (
        <>
          <gridHelper args={[20, 20]} />
          <axesHelper args={[2]} />
        </>
      )}
    </>
  );
}

const controls: { id: CameraView | "reset"; label: string }[] = [
  { id: "violin", label: "Examine Violin 🎻" },
  { id: "wall", label: "View Wall 🏠" },
  { id: "laptop", label: "Focus Laptop 💻" },
  { id: "screen", label: "View Laptop Screen ↗" },
  { id: "reset", label: "Reset Overview ↺" },
];

type SceneHistoryState = {
  configuration: SceneConfiguration;
  past: SceneConfiguration[];
  future: SceneConfiguration[];
};

type SceneHistoryAction =
  | { type: "update"; update: (configuration: SceneConfiguration) => SceneConfiguration }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; configuration: SceneConfiguration };

function sceneHistoryReducer(
  state: SceneHistoryState,
  action: SceneHistoryAction,
): SceneHistoryState {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    if (!previous) return state;
    return {
      configuration: previous,
      past: state.past.slice(0, -1),
      future: [state.configuration, ...state.future],
    };
  }
  if (action.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return {
      configuration: next,
      past: [...state.past, state.configuration].slice(-50),
      future: state.future.slice(1),
    };
  }
  if (action.type === "reset") {
    return {
      configuration: action.configuration,
      past: [...state.past, state.configuration].slice(-50),
      future: [],
    };
  }
  const configuration = action.update(state.configuration);
  if (configuration === state.configuration) return state;
  return {
    configuration,
    past: [...state.past, state.configuration].slice(-50),
    future: [],
  };
}

export default function DeskStage() {
  const [view, setView] = useState<CameraView>("overview");
  const [modelsReady, setModelsReady] = useState(false);
  const story = useRef<HTMLDivElement>(null);
  const sceneContainer = useRef<HTMLDivElement>(null);
  const [sceneVisible, setSceneVisible] = useState(false);
  const handleModelsReady = useCallback(() => setModelsReady(true), []);
  const [history, dispatchHistory] = useReducer(
    sceneHistoryReducer,
    undefined,
    (): SceneHistoryState => ({
      configuration: copyDefaultSceneConfiguration(),
      past: [],
      future: [],
    }),
  );
  const configuration = history.configuration;
  const [editorOpen, setEditorOpen] = useState(false);
  const [sceneExpanded, setSceneExpanded] = useState(false);
  const [selectedObject, setSelectedObject] = useState("desk");
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const [transformSpace, setTransformSpace] = useState<"world" | "local">("world");
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [interactionInfo, setInteractionInfo] = useState<{ title: string; content: string } | null>(null);
  const [animationToken, setAnimationToken] = useState(0);
  const [activeAnimations, setActiveAnimations] = useState<Record<string, string>>({});
  const [embeddedAnimations, setEmbeddedAnimations] = useState<Record<string, string[]>>({});
  const editorEnabled = process.env.NODE_ENV === "development";
  const objectRefs = useRef<Record<string, Group | null>>({});
  const registerObject = useCallback((id: string, object: Group | null) => {
    objectRefs.current[id] = object;
  }, []);
  const updateConfiguration = useCallback(
    (update: (current: SceneConfiguration) => SceneConfiguration) => {
      dispatchHistory({ type: "update", update });
    },
    [],
  );
  const updatePlacement = useCallback(
    (id: string, transform: SceneConfiguration["objects"][number]["transform"]) => {
      updateConfiguration((current) => ({
        ...current,
        objects: current.objects.map((object) =>
          object.id === id ? { ...object, transform } : object,
        ),
      }));
    },
    [updateConfiguration],
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
  }, [updatePlacement]);

  const renderedConfiguration = configuration.enabled
    ? configuration
    : defaultSceneConfiguration;

  const handleFocusObject = useCallback((objectId: string, duration: number) => {
    const viewByObject: Partial<Record<string, CameraView>> = {
      violin: "violin",
      laptop: "laptop",
    };
    const view = viewByObject[objectId];
    if (!view) return;
    const stop = renderedConfiguration.cameraStops.find((item) => item.view === view);
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
      { rootMargin: "200px" },
    );

    observer.observe(container);
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
              {sceneVisible ? (
                <Canvas
                  dpr={[1, Math.max(1, renderedConfiguration.environment.pixelRatioCap)]}
                  shadows={renderedConfiguration.environment.shadows}
                  camera={{ position: renderedConfiguration.cameraStops[0].position, fov: 42, near: 0.1, far: 100 }}
                  gl={{ antialias: true, alpha: false }}
                >
                  <Suspense fallback={null}>
                    <RoomScene
                      story={story}
                      onStep={setView}
                      onReady={handleModelsReady}
                      configuration={renderedConfiguration}
                      editorOpen={editorOpen}
                      selectedObject={selectedObject}
                      transformMode={transformMode}
                      transformSpace={transformSpace}
                      snapEnabled={snapEnabled}
                      objectRefs={objectRefs}
                      onObjectRef={registerObject}
                      onTransformCommit={commitObjectTransform}
                      editorEnabled={editorEnabled}
                      onSelectedObject={setSelectedObject}
                      animationToken={animationToken}
                      onInformation={(title, content) => setInteractionInfo({ title, content })}
                      onFocusObject={handleFocusObject}
                      onAnimation={handleAnimation}
                      activeAnimations={activeAnimations}
                      onEmbeddedAnimationsDiscovered={handleEmbeddedAnimationsDiscovered}
                    />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-label-code-sm text-label-code-sm text-on-surface-variant">
                  Scroll to load interactive desk
                </div>
              )}
              {sceneVisible && !modelsReady && (
                <div
                  aria-live="polite"
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-label-code-sm text-label-code-sm text-on-surface"
                >
                  <span className="rounded-lg bg-surface-container-lowest/95 px-4 py-3">
                    Loading desk models…
                  </span>
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
                      className="material-symbols-outlined text-xl text-on-surface"
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
                          className={`rounded-lg border-2 px-3 py-2 font-label-code-sm text-label-code-sm shadow-[2px_2px_0px_#080d22] transition-colors ${active
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
                  <div className="absolute bottom-3 left-3 z-20 rounded-lg border border-surface-variant bg-surface-container-lowest/90 px-3 py-2 font-label-code-sm text-label-code-sm text-on-surface-variant backdrop-blur-md sm:bottom-5 sm:left-5">
                    Scroll to explore · Click objects to interact
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-space-sm pb-1">
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                {view === "overview" && "A quiet corner, ready for a closer look."}
                {view === "violin" && "The violin rests beside the desk."}
                {view === "laptop" && "Moving in toward the laptop."}
                {view === "screen" && "A closer look at the laptop screen."}
              </span>
              <span className="font-label-code-sm text-label-code-sm text-tertiary">
                {Math.round((renderedConfiguration.cameraStops.find((stop) => stop.view === view)?.progress ?? cameraProgress[view]) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
