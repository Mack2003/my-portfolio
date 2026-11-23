import { assetRegistry } from "../registry/assetRegistry";
import defaultSceneJson from "./defaultScene.json";
import type {
  CameraView,
  SceneCameraStop,
  SceneConfiguration,
  SceneLight,
  SceneObjectInstance,
  SceneObjectTransform,
  ToneMappingMode,
} from "./sceneTypes";

const fallbackCameraStops = defaultSceneJson.cameraStops as SceneCameraStop[];

const cameraViews = new Set<CameraView>([
  "overview",
  "violin",
  "laptop",
  "screen",
  "wall",
]);
const toneMappingModes = new Set<ToneMappingMode>([
  "none",
  "linear",
  "reinhard",
  "cineon",
  "aces",
]);
const colorPattern = /^#[\da-f]{6}$/i;
const commonLightFields = [
  "id",
  "name",
  "type",
  "enabled",
  "visible",
  "color",
  "intensity",
];
const lightFieldsByType: Record<string, readonly string[]> = {
  ambient: commonLightFields,
  hemisphere: [...commonLightFields, "groundColor"],
  directional: [...commonLightFields, "position", "target", "shadows"],
  point: [...commonLightFields, "position", "distance", "decay", "shadows"],
  spot: [
    ...commonLightFields,
    "position",
    "target",
    "angle",
    "penumbra",
    "distance",
    "decay",
    "shadows",
  ],
  rectArea: [...commonLightFields, "position", "rotation", "width", "height"],
};

export class SceneConfigurationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid scene configuration: ${issues.join(" ")}`);
    this.name = "SceneConfigurationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isVector(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((coordinate) => isFiniteNumber(coordinate))
  );
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isColor(value: unknown): value is string {
  return typeof value === "string" && colorPattern.test(value);
}

function defaultVector(value: unknown, fallback: [number, number, number]) {
  return isVector(value) ? value : fallback;
}

function migrateAndDefaultConfiguration(value: unknown): unknown {
  if (!isRecord(value)) return value;
  let migrated: Record<string, unknown> = { ...value };

  if (migrated.version === 0) migrated = { ...migrated, version: 1 };
  if (migrated.version !== 1) return migrated;

  migrated.enabled ??= true;
  migrated.objects = Array.isArray(migrated.objects)
    ? migrated.objects.map((object) => {
        if (!isRecord(object)) return object;
        const transform = isRecord(object.transform) ? object.transform : {};
        const geometry = isRecord(object.geometry)
          ? {
              type: typeof object.geometry.type === "string" ? object.geometry.type : "box",
              parameters: isRecord(object.geometry.parameters) ? object.geometry.parameters : {},
            }
          : undefined;
        const material = isRecord(object.material)
          ? {
              color: object.material.color ?? "#ffffff",
              roughness: object.material.roughness ?? 0.65,
              metalness: object.material.metalness ?? 0,
              emissive: object.material.emissive ?? "#000000",
              emissiveIntensity: object.material.emissiveIntensity ?? 0,
              transparent: object.material.transparent ?? false,
              opacity: object.material.opacity ?? 1,
              wireframe: object.material.wireframe ?? false,
              side: object.material.side ?? "front",
              preserveTextureAndColor:
                typeof object.material.preserveTextureAndColor === "boolean"
                  ? object.material.preserveTextureAndColor
                  : typeof object.material.preserveOriginalTexture === "boolean"
                    ? object.material.preserveOriginalTexture
                    : undefined,
              selfGlow: typeof object.material.selfGlow === "boolean" ? object.material.selfGlow : undefined,
              emissiveMapFromBase:
                typeof object.material.emissiveMapFromBase === "boolean"
                  ? object.material.emissiveMapFromBase
                  : undefined,
            }
          : undefined;
        const glow = isRecord(object.glow)
          ? {
              enabled: object.glow.enabled ?? false,
              color: object.glow.color ?? "#ffffff",
              intensity: object.glow.intensity ?? 0,
              offsetY: typeof object.glow.offsetY === "number" ? object.glow.offsetY : 0,
            }
          : undefined;
        const animations = Array.isArray(object.animations)
          ? object.animations.map((anim) => {
              if (!isRecord(anim)) return anim;
              return {
                ...anim,
                enabledInSequence:
                  typeof anim.enabledInSequence === "boolean"
                    ? anim.enabledInSequence
                    : true,
                duration:
                  typeof anim.duration === "number" && !isNaN(anim.duration) && anim.duration > 0
                    ? anim.duration
                    : undefined,
              };
            })
          : undefined;
        const interactions = isRecord(object.interactions)
          ? {
              enabled: object.interactions.enabled ?? false,
              trigger: object.interactions.trigger ?? "click",
              actions: Array.isArray(object.interactions.actions)
                ? object.interactions.actions
                : [],
            }
          : {
              enabled: false,
              trigger: "click",
              actions: [],
            };
        return {
          ...object,
          enabled: object.enabled ?? true,
          visible: object.visible ?? true,
          castShadow: object.castShadow ?? false,
          receiveShadow: object.receiveShadow ?? false,
          interactions,
          ...(geometry ? { geometry } : {}),
          ...(material ? { material } : {}),
          ...(glow ? { glow } : {}),
          ...(animations ? { animations } : {}),
          defaultAnimationId:
            typeof object.defaultAnimationId === "string"
              ? object.defaultAnimationId
              : undefined,
          continueAllAnimationsInLoop:
            typeof object.continueAllAnimationsInLoop === "boolean"
              ? object.continueAllAnimationsInLoop
              : undefined,
          transform: {
            ...transform,
            position: defaultVector(transform.position, [0, 0, 0]),
            rotation: defaultVector(transform.rotation, [0, 0, 0]),
            scale: defaultVector(transform.scale, [1, 1, 1]),
          },
        };
      })
    : migrated.objects;
  migrated.lights = Array.isArray(migrated.lights)
    ? migrated.lights.map((light) => {
        if (!isRecord(light) || typeof light.type !== "string") return light;
        const normalized: Record<string, unknown> = {
          ...light,
          enabled: light.enabled ?? true,
          visible: light.visible ?? true,
          color: light.color ?? "#ffffff",
          intensity: light.intensity ?? 1,
        };
        if (light.type === "hemisphere") normalized.groundColor ??= "#453b39";
        if (light.type === "directional" || light.type === "spot") {
          normalized.position = defaultVector(light.position, [0, 3, 0]);
          normalized.target = defaultVector(light.target, [0, 0, 0]);
          normalized.shadows ??= false;
        }
        if (light.type === "point") {
          normalized.position = defaultVector(light.position, [0, 3, 0]);
          normalized.distance ??= 0;
          normalized.decay ??= 2;
          normalized.shadows ??= false;
        }
        if (light.type === "spot") {
          normalized.angle ??= Math.PI / 6;
          normalized.penumbra ??= 0.2;
          normalized.distance ??= 0;
          normalized.decay ??= 2;
        }
        if (light.type === "rectArea") {
          normalized.position = defaultVector(light.position, [0, 3, 0]);
          normalized.rotation = defaultVector(light.rotation, [0, 0, 0]);
          normalized.width ??= 2;
          normalized.height ??= 1;
        }
        return normalized;
      })
    : migrated.lights;

  const environment = isRecord(migrated.environment) ? migrated.environment : {};
  const fog = isRecord(environment.fog) ? environment.fog : {};
  migrated.environment = {
    background: environment.background ?? "#11152f",
    environmentIntensity: environment.environmentIntensity ?? 1,
    shadows: environment.shadows ?? false,
    toneMapping: environment.toneMapping ?? "none",
    exposure: environment.exposure ?? 1,
    pixelRatioCap: environment.pixelRatioCap ?? 1.5,
    fog: {
      enabled: fog.enabled ?? false,
      color: fog.color ?? "#11152f",
      near: fog.near ?? 4,
      far: fog.far ?? 30,
    },
  };
  migrated.cameraStops ??= structuredClone(fallbackCameraStops);
  return migrated;
}

function validateTransform(value: unknown, issues: string[], label: string): value is SceneObjectTransform {
  if (!isRecord(value)) {
    issues.push(`${label} transform must be an object.`);
    return false;
  }

  let valid = true;
  for (const field of ["position", "rotation", "scale"] as const) {
    if (!isVector(value[field])) {
      issues.push(`${label} transform ${field} must contain three finite numbers.`);
      valid = false;
    }
  }
  if (isVector(value.scale) && value.scale.some((scale) => scale === 0)) {
    issues.push(`${label} scale values cannot be zero.`);
    valid = false;
  }
  return valid;
}

function validateInteractions(value: unknown, issues: string[], label: string): boolean {
  if (!isRecord(value)) {
    issues.push(`${label} interactions must be an object.`);
    return false;
  }
  let valid = true;
  if (!isBoolean(value.enabled)) {
    issues.push(`${label} interactions enabled must be a boolean.`);
    valid = false;
  }
  if (value.trigger !== "click") {
    issues.push(`${label} interaction trigger must be "click".`);
    valid = false;
  }
  if (!Array.isArray(value.actions)) {
    issues.push(`${label} interaction actions must be an array.`);
    return false;
  }
  value.actions.forEach((action, index) => {
    if (!isRecord(action) || typeof action.type !== "string") {
      issues.push(`${label} interaction action ${index + 1} must be an object.`);
      valid = false;
      return;
    }
    switch (action.type) {
      case "playAudio":
        if (!isNonEmptyString(action.audio) || (action.volume !== undefined && (!isFiniteNumber(action.volume) || action.volume < 0 || action.volume > 1)) || (action.loop !== undefined && !isBoolean(action.loop))) valid = false;
        break;
      case "stopAudio":
        if ((action.id !== undefined && !isNonEmptyString(action.id)) || (action.targetObjectId !== undefined && !isNonEmptyString(action.targetObjectId))) valid = false;
        break;
      case "playAnimation":
        if (!isNonEmptyString(action.animation) || (action.loop !== undefined && !isBoolean(action.loop)) || (action.timeScale !== undefined && (!isFiniteNumber(action.timeScale) || action.timeScale <= 0)) || (action.duration !== undefined && (!isFiniteNumber(action.duration) || action.duration <= 0))) valid = false;
        break;
      case "openModal":
        if (!isNonEmptyString(action.modal)) valid = false;
        break;
      case "openUrl":
        if (!isNonEmptyString(action.url) || (action.target !== undefined && action.target !== "_self" && action.target !== "_blank")) valid = false;
        break;
      case "showInformation":
        if (!isNonEmptyString(action.title) || !isNonEmptyString(action.content)) valid = false;
        break;
      case "focusObject":
        if ((action.objectId !== undefined && !isNonEmptyString(action.objectId)) || (action.duration !== undefined && (!isFiniteNumber(action.duration) || action.duration <= 0))) valid = false;
        break;
      case "enterCubeView":
        if (
          (action.id !== undefined && !isNonEmptyString(action.id)) ||
          (action.targetObjectId !== undefined && !isNonEmptyString(action.targetObjectId)) ||
          (action.duration !== undefined && (!isFiniteNumber(action.duration) || action.duration <= 0)) ||
          (action.cameraDistance !== undefined && (!isFiniteNumber(action.cameraDistance) || action.cameraDistance <= 0)) ||
          (action.cameraHeight !== undefined && !isFiniteNumber(action.cameraHeight))
        ) {
          valid = false;
        }
        break;
      case "toggleViolinMusic":
        if (
          (action.id !== undefined && !isNonEmptyString(action.id)) ||
          (action.targetObjectId !== undefined && !isNonEmptyString(action.targetObjectId))
        ) {
          valid = false;
        }
        break;
      case "customAction":
        if (!isNonEmptyString(action.name)) valid = false;
        break;
      default:
        valid = false;
    }
    if (!valid) issues.push(`${label} has an invalid interaction action ${index + 1}.`);
  });
  return valid;
}

function validateObject(
  value: unknown,
  index: number,
  issues: string[],
  prefix = "Object",
): value is SceneObjectInstance {
  const label = `${prefix} ${index + 1}`;
  if (!isRecord(value)) {
    issues.push(`${label} must be an object.`);
    return false;
  }

  let valid = true;
  for (const field of ["id", "name"] as const) {
    if (!isNonEmptyString(value[field])) {
      issues.push(`${label} ${field} must be a non-empty string.`);
      valid = false;
    }
  }
  if (!isRecord(value.geometry) && !isNonEmptyString(value.assetId)) {
    issues.push(`${label} assetId must be a non-empty string for model objects.`);
    valid = false;
  }
  if (isNonEmptyString(value.assetId) && value.assetId && !assetRegistry.some((asset) => asset.id === value.assetId)) {
    issues.push(`${label} references unknown model asset "${value.assetId}".`);
    valid = false;
  }
  for (const field of ["enabled", "visible", "castShadow", "receiveShadow"] as const) {
    if (!isBoolean(value[field])) {
      issues.push(`${label} ${field} must be a boolean.`);
      valid = false;
    }
  }
  if (value.geometry !== undefined) {
    if (!isRecord(value.geometry)) {
      issues.push(`${label} geometry must be an object.`);
      valid = false;
    } else {
      const types = new Set(["box", "sphere", "cylinder", "plane", "cone", "torus", "capsule", "circle", "ring"]);
      if (typeof value.geometry.type !== "string" || !types.has(value.geometry.type)) {
        issues.push(`${label} has an unsupported primitive geometry.`);
        valid = false;
      }
      if (!isRecord(value.geometry.parameters) || Object.values(value.geometry.parameters).some((parameter) => !isFiniteNumber(parameter))) {
        issues.push(`${label} primitive geometry parameters must be finite numbers.`);
        valid = false;
      }
    }
  }
  if (value.material !== undefined) {
    if (!isRecord(value.material)) {
      issues.push(`${label} material must be an object.`);
      valid = false;
    } else {
      if (!isColor(value.material.color) || !isColor(value.material.emissive)) {
        issues.push(`${label} material colors must use #RRGGBB format.`);
        valid = false;
      }
      if (
        !isFiniteNumber(value.material.roughness) ||
        value.material.roughness < 0 ||
        value.material.roughness > 1 ||
        !isFiniteNumber(value.material.metalness) ||
        value.material.metalness < 0 ||
        value.material.metalness > 1 ||
        !isFiniteNumber(value.material.emissiveIntensity) ||
        value.material.emissiveIntensity < 0 ||
        !isFiniteNumber(value.material.opacity) ||
        value.material.opacity < 0 ||
        value.material.opacity > 1 ||
        !isBoolean(value.material.transparent) ||
        !isBoolean(value.material.wireframe) ||
        !["front", "back", "double"].includes(String(value.material.side)) ||
        (value.material.preserveTextureAndColor !== undefined &&
          !isBoolean(value.material.preserveTextureAndColor)) ||
        (value.material.preserveOriginalTexture !== undefined &&
          !isBoolean(value.material.preserveOriginalTexture)) ||
        (value.material.selfGlow !== undefined &&
          !isBoolean(value.material.selfGlow)) ||
        (value.material.emissiveMapFromBase !== undefined &&
          !isBoolean(value.material.emissiveMapFromBase))
      ) {
        issues.push(`${label} material properties are invalid.`);
        valid = false;
      }
    }
  }
  if (value.glow !== undefined) {
    if (
      !isRecord(value.glow) ||
      !isBoolean(value.glow.enabled) ||
      !isColor(value.glow.color) ||
      !isFiniteNumber(value.glow.intensity) ||
      value.glow.intensity < 0 ||
      (value.glow.offsetY !== undefined && !isFiniteNumber(value.glow.offsetY))
    ) {
      issues.push(`${label} glow requires an enabled flag, #RRGGBB color, non-negative intensity, and optional finite offsetY.`);
      valid = false;
    }
    if (
      value.continueAllAnimationsInLoop !== undefined &&
      !isBoolean(value.continueAllAnimationsInLoop)
    ) {
      issues.push(`${label} continueAllAnimationsInLoop must be a boolean.`);
      valid = false;
    }
  }
  if (value.animations !== undefined) {
    if (!Array.isArray(value.animations)) {
      issues.push(`${label} animations must be an array.`);
      valid = false;
    } else {
      value.animations.forEach((animation, animationIndex) => {
        if (!isRecord(animation)) {
          issues.push(`${label} animation ${animationIndex + 1} must be an object.`);
          valid = false;
          return;
        }
        if (
          !isNonEmptyString(animation.id) ||
          !isNonEmptyString(animation.name) ||
          (animation.type !== "embedded" && animation.type !== "preset") ||
          !isBoolean(animation.loop) ||
          !isFiniteNumber(animation.timeScale) ||
          animation.timeScale <= 0 ||
          (animation.duration !== undefined && (!isFiniteNumber(animation.duration) || animation.duration <= 0)) ||
          (animation.enabledInSequence !== undefined && !isBoolean(animation.enabledInSequence))
        ) {
          issues.push(`${label} animation ${animationIndex + 1} is invalid.`);
          valid = false;
        }
        if (
          animation.type === "embedded" &&
          !isNonEmptyString(animation.clipName)
        ) {
          issues.push(`${label} embedded animation ${animationIndex + 1} requires clipName.`);
          valid = false;
        }
        if (
          animation.type === "preset" &&
          ![
            "pulse",
            "bounce",
            "rotate",
            "violin-sway",
            "floating-hover",
            "bow-swing",
            "bow-stroke",
          ].includes(String(animation.preset))
        ) {
          issues.push(`${label} preset animation ${animationIndex + 1} is unsupported.`);
          valid = false;
        }
      });
    }
  }
  if (value.interactions !== undefined) {
    if (!validateInteractions(value.interactions, issues, label)) valid = false;
  }
  if (!validateTransform(value.transform, issues, label)) valid = false;
  return valid;
}

function validateLight(
  value: unknown,
  index: number,
  issues: string[],
  prefix = "Light",
): value is SceneLight {
  const label = `${prefix} ${index + 1}`;
  if (!isRecord(value)) {
    issues.push(`${label} must be an object.`);
    return false;
  }
  const validTypes = new Set(["ambient", "hemisphere", "directional", "point", "spot", "rectArea"]);
  let valid = true;

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name)) {
    issues.push(`${label} id and name must be non-empty strings.`);
    valid = false;
  }
  if (typeof value.type !== "string" || !validTypes.has(value.type)) {
    issues.push(`${label} has an unsupported type.`);
    return false;
  }
  for (const field of Object.keys(value)) {
    if (!lightFieldsByType[value.type].includes(field)) {
      issues.push(`${label} property "${field}" is not supported for ${value.type} lights.`);
      valid = false;
    }
  }
  if (
    !isBoolean(value.enabled) ||
    !isBoolean(value.visible) ||
    !isColor(value.color) ||
    !isFiniteNumber(value.intensity) ||
    value.intensity < 0
  ) {
    issues.push(`${label} requires enabled/visible flags, a #RRGGBB color, and non-negative intensity.`);
    valid = false;
  }

  const vectorFields =
    value.type === "directional" || value.type === "spot"
      ? ["position", "target"]
      : value.type === "point"
        ? ["position"]
        : value.type === "rectArea"
          ? ["position", "rotation"]
          : [];
  for (const field of vectorFields) {
    if (!isVector(value[field])) {
      issues.push(`${label} ${field} must contain three finite numbers.`);
      valid = false;
    }
  }

  const numericFields =
    value.type === "point"
      ? ["distance", "decay"]
      : value.type === "spot"
        ? ["angle", "penumbra", "distance", "decay"]
        : value.type === "rectArea"
          ? ["width", "height"]
          : [];
  for (const field of numericFields) {
    if (!isFiniteNumber(value[field])) {
      issues.push(`${label} ${field} must be a finite number.`);
      valid = false;
    }
  }
  if (
    (value.type === "point" || value.type === "spot") &&
    ((isFiniteNumber(value.distance) && value.distance < 0) ||
      (isFiniteNumber(value.decay) && value.decay < 0))
  ) {
    issues.push(`${label} distance and decay cannot be negative.`);
    valid = false;
  }
  if (
    value.type === "spot" &&
    ((isFiniteNumber(value.angle) && (value.angle <= 0 || value.angle > Math.PI / 2)) ||
      (isFiniteNumber(value.penumbra) && (value.penumbra < 0 || value.penumbra > 1)))
  ) {
    issues.push(`${label} angle must be in (0, π/2] and penumbra in [0, 1].`);
    valid = false;
  }
  if (
    value.type === "rectArea" &&
    ((isFiniteNumber(value.width) && value.width <= 0) ||
      (isFiniteNumber(value.height) && value.height <= 0))
  ) {
    issues.push(`${label} width and height must be positive.`);
    valid = false;
  }
  if (value.type === "hemisphere" && !isColor(value.groundColor)) {
    issues.push(`${label} groundColor must be a #RRGGBB color.`);
    valid = false;
  }
  if (
    (value.type === "directional" || value.type === "point" || value.type === "spot") &&
    !isBoolean(value.shadows)
  ) {
    issues.push(`${label} shadows must be a boolean.`);
    valid = false;
  }
  return valid;
}

export function validateSceneConfiguration(value: unknown): SceneConfiguration {
  const issues: string[] = [];
  const normalized = migrateAndDefaultConfiguration(value);
  if (!isRecord(normalized)) {
    throw new SceneConfigurationError(["The configuration must be an object."]);
  }
  const config = normalized;

  if (!isNonEmptyString(config.id) || !isNonEmptyString(config.name)) {
    issues.push("Scene id and name must be non-empty strings.");
  }
  if (config.version !== 1) issues.push(`Unsupported schema version "${String(config.version)}".`);
  if (!isBoolean(config.enabled)) issues.push("Scene enabled must be a boolean.");

  if (!Array.isArray(config.objects)) {
    issues.push("Scene objects must be an array.");
  } else {
    config.objects.forEach((object, index) => validateObject(object, index, issues));
    const ids = config.objects.filter(isRecord).map((object) => object.id);
    if (new Set(ids).size !== ids.length) issues.push("Object instance IDs must be unique.");
  }
  if (!Array.isArray(config.lights)) {
    issues.push("Scene lights must be an array.");
  } else {
    config.lights.forEach((light, index) => validateLight(light, index, issues));
    const ids = config.lights.filter(isRecord).map((light) => light.id);
    if (new Set(ids).size !== ids.length) issues.push("Light IDs must be unique.");
  }

  const environment = config.environment;
  if (!isRecord(environment)) {
    issues.push("Scene environment must be an object.");
  } else {
    if (!isColor(environment.background)) issues.push("Environment background must be a #RRGGBB color.");
    if (!isFiniteNumber(environment.environmentIntensity) || environment.environmentIntensity < 0) {
      issues.push("Environment intensity must be a non-negative number.");
    }
    if (!isBoolean(environment.shadows)) issues.push("Environment shadows must be a boolean.");
    if (!isFiniteNumber(environment.exposure) || environment.exposure <= 0) {
      issues.push("Environment exposure must be a positive number.");
    }
    if (
      !isFiniteNumber(environment.pixelRatioCap) ||
      environment.pixelRatioCap < 1 ||
      environment.pixelRatioCap > 2
    ) {
      issues.push("Environment pixel ratio cap must be between 1 and 2.");
    }
    if (typeof environment.toneMapping !== "string" || !toneMappingModes.has(environment.toneMapping as ToneMappingMode)) {
      issues.push("Environment tone mapping mode is unsupported.");
    }
    if (!isRecord(environment.fog)) {
      issues.push("Environment fog must be an object.");
    } else {
      if (!isBoolean(environment.fog.enabled) || !isColor(environment.fog.color)) {
        issues.push("Fog requires an enabled flag and a #RRGGBB color.");
      }
      if (
        !isFiniteNumber(environment.fog.near) ||
        !isFiniteNumber(environment.fog.far) ||
        environment.fog.near < 0 ||
        environment.fog.far <= environment.fog.near
      ) {
        issues.push("Fog far distance must be greater than its non-negative near distance.");
      }
    }
  }

  if (!Array.isArray(config.cameraStops) || config.cameraStops.length < 2) {
    issues.push("Camera stops must contain at least two stops.");
  } else {
    let previousProgress = -1;
    config.cameraStops.forEach((stop, index) => {
      if (!isRecord(stop)) {
        issues.push(`Camera stop ${index + 1} must be an object.`);
        return;
      }
      if (!isFiniteNumber(stop.progress) || stop.progress < 0 || stop.progress > 1) {
        issues.push(`Camera stop ${index + 1} progress must be between 0 and 1.`);
      } else if (stop.progress <= previousProgress) {
        issues.push("Camera stop progress values must be strictly increasing.");
      } else {
        previousProgress = stop.progress;
      }
      if (typeof stop.view !== "string" || !cameraViews.has(stop.view as CameraView)) {
        issues.push(`Camera stop ${index + 1} has an unsupported view.`);
      }
      if (!isVector(stop.position) || !isVector(stop.target)) {
        issues.push(`Camera stop ${index + 1} position and target must be three-number vectors.`);
      }
    });
  }

  const cubeStudio = config.cubeStudio;
  if (cubeStudio !== undefined) {
    if (!isRecord(cubeStudio)) {
      issues.push("Scene cubeStudio must be an object.");
    } else {
      if (!isBoolean(cubeStudio.enabled)) issues.push("cubeStudio enabled must be a boolean.");
      if (!isFiniteNumber(cubeStudio.cubeSize) || cubeStudio.cubeSize <= 0) issues.push("cubeStudio cubeSize must be a positive number.");
      if (cubeStudio.position !== undefined && !isVector(cubeStudio.position)) issues.push("cubeStudio position must be a three-number vector.");
      if (!isColor(cubeStudio.interiorColor)) issues.push("cubeStudio interiorColor must be a #RRGGBB color.");
      if (Array.isArray(cubeStudio.lights)) {
        cubeStudio.lights.forEach((light, i) => validateLight(light, i, issues, "Cube Studio Light"));
      }
      if (cubeStudio.objects !== undefined) {
        if (!Array.isArray(cubeStudio.objects)) {
          issues.push("cubeStudio objects must be an array.");
        } else {
          cubeStudio.objects.forEach((object, i) => validateObject(object, i, issues, "Cube Studio Object"));
        }
      }
    }
  }

  if (issues.length) throw new SceneConfigurationError(issues);
  return config as SceneConfiguration;
}
