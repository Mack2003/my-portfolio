/* eslint-disable @typescript-eslint/no-unused-vars */
import type { VectorTuple } from "../deskSceneLayout";
import type { SceneCameraStop, SceneConfiguration } from "./sceneTypes";
import { defaultCameraStops } from "./defaultScene";

export type ResponsiveDeviceMode = "desktop" | "tablet" | "mobile";

export type ResponsiveObjectTransformOverride = {
  position?: VectorTuple;
  rotation?: VectorTuple;
  scale?: VectorTuple;
  visible?: boolean;
};

export type ResponsiveSceneProfile = {
  fov: number;
  cameraStops: SceneCameraStop[];
  objectOverrides: Record<string, ResponsiveObjectTransformOverride>;
  cubeCameraDistance?: number;
};

/**
 * Canonical Camera Stops:
 * Uses defaultCameraStops directly to ensure the original, authentic camera positions
 * are strictly preserved on all viewports and devices.
 */
export const mobilePortraitCameraStops: SceneCameraStop[] = defaultCameraStops;
export const tabletCameraStops: SceneCameraStop[] = defaultCameraStops;

export const mobileObjectOverrides: Record<string, ResponsiveObjectTransformOverride> = {};
export const tabletObjectOverrides: Record<string, ResponsiveObjectTransformOverride> = {};

export const sceneConfig: Record<ResponsiveDeviceMode, ResponsiveSceneProfile> = {
  desktop: {
    fov: 42,
    cameraStops: defaultCameraStops,
    objectOverrides: {},
    cubeCameraDistance: 3.8,
  },
  tablet: {
    fov: 42,
    cameraStops: defaultCameraStops,
    objectOverrides: {},
    cubeCameraDistance: 3.8,
  },
  mobile: {
    fov: 42,
    cameraStops: defaultCameraStops,
    objectOverrides: {},
    cubeCameraDistance: 3.8,
  },
};

/**
 * Standard camera FOV for the desk scene.
 * Preserves the original 42 degrees FOV across all devices.
 */
export function getResponsiveCameraFov(
  ..._args: unknown[]
): number {
  return 42;
}

/**
 * Returns the authentic SceneConfiguration without altering camera stops or object coordinates.
 */
export function getResponsiveSceneConfiguration(
  baseConfig: SceneConfiguration,
  ..._args: unknown[]
): SceneConfiguration {
  return baseConfig;
}
