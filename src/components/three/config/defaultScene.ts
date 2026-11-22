import defaultSceneJson from "./defaultScene.json";
import { validateSceneConfiguration } from "./sceneValidation";
import type { CameraView, SceneCameraStop, SceneConfiguration } from "./sceneTypes";

/**
 * Validated canonical 3D scene configuration loaded directly from defaultScene.json.
 * To update the default scene, simply paste your copied scene JSON into defaultScene.json.
 */
export const defaultSceneConfiguration: SceneConfiguration =
  validateSceneConfiguration(defaultSceneJson);

export const defaultCameraStops: SceneCameraStop[] =
  defaultSceneConfiguration.cameraStops;

export const cameraProgress: Record<CameraView, number> = {
  overview: 0,
  wall: 0.3,
  violin: 0.56,
  laptop: 0.78,
  screen: 1,
};

export function copyDefaultSceneConfiguration(): SceneConfiguration {
  return structuredClone(defaultSceneConfiguration);
}
