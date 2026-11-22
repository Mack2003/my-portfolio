import type { VectorTuple } from "../deskSceneLayout";

export type CameraView = "overview" | "violin" | "laptop" | "screen" | "wall";

export type SceneCameraStop = {
  progress: number;
  view: CameraView;
  position: VectorTuple;
  target: VectorTuple;
};

export type SceneObjectTransform = {
  position: VectorTuple;
  rotation: VectorTuple;
  scale: VectorTuple;
};

export type SceneInteractionAction =
  | { type: "playAudio"; id?: string; audio: string; volume?: number; loop?: boolean }
  | { type: "stopAudio"; id?: string; targetObjectId?: string }
  | { type: "playAnimation"; animation: string; loop?: boolean; timeScale?: number; duration?: number }
  | { type: "openModal"; modal: string; title?: string; content?: string }
  | { type: "openUrl"; url: string; target?: "_self" | "_blank" }
  | { type: "showInformation"; title: string; content: string }
  | { type: "focusObject"; objectId?: string; duration?: number }
  | {
      type: "enterCubeView";
      id?: string;
      targetObjectId?: string;
      duration?: number;
      cameraDistance?: number;
      cameraHeight?: number;
    }
  | { type: "customAction"; name: string; payload?: Record<string, string | number | boolean> };

export type SceneObjectInteractions = {
  enabled: boolean;
  trigger: "click";
  actions: SceneInteractionAction[];
};

export type ScenePrimitiveType =
  | "box"
  | "sphere"
  | "cylinder"
  | "plane"
  | "cone"
  | "torus"
  | "capsule"
  | "circle"
  | "ring";

export type ScenePrimitiveGeometry = {
  type: ScenePrimitiveType;
  parameters: Record<string, number>;
};

export type SceneObjectMaterial = {
  color: string;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
  transparent: boolean;
  opacity: number;
  wireframe: boolean;
  side: "front" | "back" | "double";
  preserveTextureAndColor?: boolean;
  preserveOriginalTexture?: boolean;
  selfGlow?: boolean;
  emissiveMapFromBase?: boolean;
};

export type SceneObjectGlow = {
  enabled: boolean;
  color: string;
  intensity: number;
  offsetY?: number;
};

export type SceneObjectPresetAnimation =
  | "pulse"
  | "bounce"
  | "rotate"
  | "violin-sway"
  | "floating-hover"
  | "bow-swing"
  | "bow-stroke";

export type SceneObjectAnimation = {
  id: string;
  name: string;
  type: "embedded" | "preset";
  clipName?: string;
  preset?: SceneObjectPresetAnimation;
  loop: boolean;
  timeScale: number;
  duration?: number;
  enabledInSequence?: boolean;
};

export type SceneObjectInstance = {
  id: string;
  assetId: string;
  name: string;
  enabled: boolean;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  transform: SceneObjectTransform;
  interactions?: SceneObjectInteractions;
  geometry?: ScenePrimitiveGeometry;
  material?: SceneObjectMaterial;
  glow?: SceneObjectGlow;
  animations?: SceneObjectAnimation[];
  defaultAnimationId?: string;
  continueAllAnimationsInLoop?: boolean;
};

type SceneLightBase = {
  id: string;
  name: string;
  enabled: boolean;
  visible: boolean;
  color: string;
  intensity: number;
};

export type AmbientSceneLight = SceneLightBase & { type: "ambient" };
export type HemisphereSceneLight = SceneLightBase & {
  type: "hemisphere";
  groundColor: string;
};
export type DirectionalSceneLight = SceneLightBase & {
  type: "directional";
  position: VectorTuple;
  target: VectorTuple;
  shadows: boolean;
};
export type PointSceneLight = SceneLightBase & {
  type: "point";
  position: VectorTuple;
  distance: number;
  decay: number;
  shadows: boolean;
};
export type SpotSceneLight = SceneLightBase & {
  type: "spot";
  position: VectorTuple;
  target: VectorTuple;
  angle: number;
  penumbra: number;
  distance: number;
  decay: number;
  shadows: boolean;
};
export type RectAreaSceneLight = SceneLightBase & {
  type: "rectArea";
  position: VectorTuple;
  rotation: VectorTuple;
  width: number;
  height: number;
};

export type SceneLight =
  | AmbientSceneLight
  | HemisphereSceneLight
  | DirectionalSceneLight
  | PointSceneLight
  | SpotSceneLight
  | RectAreaSceneLight;

export type ToneMappingMode = "none" | "linear" | "reinhard" | "cineon" | "aces";

export type SceneEnvironment = {
  background: string;
  environmentIntensity: number;
  shadows: boolean;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  toneMapping: ToneMappingMode;
  exposure: number;
  pixelRatioCap: number;
};

export type CubeStudioConfiguration = {
  enabled: boolean;
  cubeSize: number;
  position?: VectorTuple;
  interiorColor: string;
  roughness: number;
  metalness: number;
  cameraDistance: number;
  cameraHeight: number;
  transitionDuration: number;
  lights: SceneLight[];
  objects?: SceneObjectInstance[];
};

export type SceneConfiguration = {
  id: string;
  name: string;
  version: 1;
  enabled: boolean;
  objects: SceneObjectInstance[];
  lights: SceneLight[];
  environment: SceneEnvironment;
  cameraStops: SceneCameraStop[];
  cubeStudio?: CubeStudioConfiguration;
};
