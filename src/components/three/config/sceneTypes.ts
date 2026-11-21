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

export type SceneObjectInstance = {
  id: string;
  assetId: string;
  name: string;
  enabled: boolean;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  transform: SceneObjectTransform;
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

export type SceneConfiguration = {
  id: string;
  name: string;
  version: 1;
  enabled: boolean;
  objects: SceneObjectInstance[];
  lights: SceneLight[];
  environment: SceneEnvironment;
  cameraStops: SceneCameraStop[];
};
