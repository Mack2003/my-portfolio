import type { VectorTuple } from "../deskSceneLayout";
import type { SceneCameraStop, SceneConfiguration, SceneObjectInstance } from "./sceneTypes";
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
 * Mobile Portrait Camera Stops:
 * Specially composed vertical trajectory for narrow aspect ratios, ensuring
 * overview, wall badges, violin, laptop, and screen are centered and comfortable.
 */
export const mobilePortraitCameraStops: SceneCameraStop[] = [
  {
    progress: 0,
    view: "overview",
    position: [0.1, 2.4, 6.4],
    target: [0.1, 1.15, -1.5],
  },
  {
    progress: 0.3,
    view: "wall",
    position: [1.3, 1.6, 1.2],
    target: [-1.9, 1.3, 0.8],
  },
  {
    progress: 0.56,
    view: "violin",
    position: [0.3, 1.45, 1.8],
    target: [-1.0, 1.15, -2.4],
  },
  {
    progress: 0.78,
    view: "laptop",
    position: [0.85, 2.3, -0.6],
    target: [0.85, 1.65, -2.6],
  },
  {
    progress: 1,
    view: "screen",
    position: [0.85, 2.2, -1.6],
    target: [0.85, 1.6, -3.4],
  },
];

/**
 * Tablet Camera Stops:
 * Balanced framing for medium screens and aspect ratios.
 */
export const tabletCameraStops: SceneCameraStop[] = [
  {
    progress: 0,
    view: "overview",
    position: [0, 2.2, 5.4],
    target: [0, 1.1, -1.2],
  },
  {
    progress: 0.3,
    view: "wall",
    position: [2.2, 1.6, 0.5],
    target: [-14.5, 1.25, -2.8],
  },
  {
    progress: 0.56,
    view: "violin",
    position: [1.2, 1.4, 2.1],
    target: [-0.4, 1.1, -1.2],
  },
  {
    progress: 0.78,
    view: "laptop",
    position: [1.6, 2.3, -0.4],
    target: [1.75, 1.75, -2.15],
  },
  {
    progress: 1,
    view: "screen",
    position: [1.65, 2.45, -1.4],
    target: [1.65, 1.65, -3.55],
  },
];

/**
 * Object placement overrides for Mobile Portrait composition.
 * Brings objects into a cohesive vertical arrangement without horizontal clipping.
 */
export const mobileObjectOverrides: Record<string, ResponsiveObjectTransformOverride> = {
  desk: {
    position: [0.65, 0.337, -2.5],
  },
  laptop: {
    position: [0.85, 1.428, -2.78],
  },
  plant: {
    position: [-0.15, 1.482, -2.75],
  },
  officeChair: {
    position: [1.1, 0.1, -0.9],
    rotation: [0, -50, 0],
  },
  violin: {
    position: [-1.2, 1.13, -3.1],
    rotation: [-1, -31, -66],
  },
  bookshelf: {
    position: [-1.95, 0.095, 0.4],
  },
  vitest3dLogo: {
    position: [-1.9, 2.15, -0.1],
  },
  visualStudioCode: {
    position: [-1.9, 0.45, 1.35],
  },
  typescriptLogo: {
    position: [-1.85, 1.56, 1.25],
  },
  reactLogoCircle: {
    position: [-1.88, 0.98, 1.3],
  },
  javascriptLogo: {
    position: [-1.92, 2.12, 1.28],
  },
  githubKitten: {
    position: [-1.88, 0.48, 0.6],
  },
  awsLogo: {
    position: [-1.9, 1.55, 0.6],
  },
  androidBug: {
    position: [-1.88, 0.96, -0.1],
  },
  "firebase-logo-3bebdf91-c19a-4fb7-bd20-c61fd328740f": {
    position: [-1.9, 0.43, -0.1],
  },
  "mongodb-logo-3d-model-451d068b-41f3-4ca6-a485-8577d21681e1": {
    position: [-1.9, 1.53, -0.1],
  },
};

/**
 * Object placement overrides for Tablet composition.
 */
export const tabletObjectOverrides: Record<string, ResponsiveObjectTransformOverride> = {
  desk: {
    position: [1.2, 0.337, -2.55],
  },
  laptop: {
    position: [1.59, 1.428, -2.839],
  },
  plant: {
    position: [0.45, 1.482, -2.8],
  },
  violin: {
    position: [-1.8, 1.13, -3.25],
  },
  officeChair: {
    position: [1.95, 0.1, -0.4],
  },
};

/**
 * Reusable configuration objects for Desktop, Tablet, and Mobile.
 */
export const sceneConfig: Record<ResponsiveDeviceMode, ResponsiveSceneProfile> = {
  desktop: {
    fov: 42,
    cameraStops: defaultCameraStops,
    objectOverrides: {},
    cubeCameraDistance: 3.8,
  },
  tablet: {
    fov: 48,
    cameraStops: tabletCameraStops,
    objectOverrides: tabletObjectOverrides,
    cubeCameraDistance: 4.1,
  },
  mobile: {
    fov: 55,
    cameraStops: mobilePortraitCameraStops,
    objectOverrides: mobileObjectOverrides,
    cubeCameraDistance: 4.5,
  },
};

/**
 * Get the target camera FOV based on device mode and orientation.
 */
export function getResponsiveCameraFov(
  mode: ResponsiveDeviceMode,
  orientation: "portrait" | "landscape" = "landscape"
): number {
  if (mode === "mobile") {
    return orientation === "portrait" ? 55 : 45;
  }
  if (mode === "tablet") {
    return orientation === "portrait" ? 52 : 48;
  }
  return 42;
}

/**
 * Resolves a unified SceneConfiguration for the target device mode.
 * Reuses all original 3D objects, geometries, textures, materials, and interactions,
 * only overriding responsive layout, camera composition, and spacing.
 */
export function getResponsiveSceneConfiguration(
  baseConfig: SceneConfiguration,
  mode: ResponsiveDeviceMode,
  orientation: "portrait" | "landscape" = "landscape"
): SceneConfiguration {
  // Whenever the scene is displayed in horizontal/landscape mode (desktop, or mobile in fullscreen landscape),
  // return the canonical base desktop horizontal configuration so the 3D room, desk, chair, and violin
  // adopt their natural, wide horizontal layout without squishing or vertical shifting.
  if (orientation === "landscape") {
    return baseConfig;
  }

  const profile = sceneConfig[mode] ?? sceneConfig.desktop;

  const overrides = profile.objectOverrides;

  const responsiveObjects: SceneObjectInstance[] = baseConfig.objects.map((obj) => {
    const override = overrides[obj.id];
    if (!override) return obj;

    return {
      ...obj,
      visible: override.visible !== undefined ? override.visible : obj.visible,
      transform: {
        position: override.position ? [...override.position] : [...obj.transform.position],
        rotation: override.rotation ? [...override.rotation] : [...obj.transform.rotation],
        scale: override.scale ? [...override.scale] : [...obj.transform.scale],
      },
    };
  });

  return {
    ...baseConfig,
    cameraStops: profile.cameraStops.length > 0 ? profile.cameraStops : baseConfig.cameraStops,
    objects: responsiveObjects,
    cubeStudio: baseConfig.cubeStudio
      ? {
          ...baseConfig.cubeStudio,
          cameraDistance: profile.cubeCameraDistance ?? baseConfig.cubeStudio.cameraDistance,
        }
      : undefined,
  };
}
