import { assetRegistry } from "../registry/assetRegistry";
import { defaultCameraStops } from "./defaultScene";
import type {
  CameraView,
  SceneConfiguration,
  SceneLight,
  SceneObjectInstance,
  SceneObjectTransform,
  ToneMappingMode,
} from "./sceneTypes";

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
        return {
          ...object,
          enabled: object.enabled ?? true,
          visible: object.visible ?? true,
          castShadow: object.castShadow ?? false,
          receiveShadow: object.receiveShadow ?? false,
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
  migrated.cameraStops ??= structuredClone(defaultCameraStops);
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

function validateObject(
  value: unknown,
  index: number,
  issues: string[],
): value is SceneObjectInstance {
  const label = `Object ${index + 1}`;
  if (!isRecord(value)) {
    issues.push(`${label} must be an object.`);
    return false;
  }

  let valid = true;
  for (const field of ["id", "assetId", "name"] as const) {
    if (!isNonEmptyString(value[field])) {
      issues.push(`${label} ${field} must be a non-empty string.`);
      valid = false;
    }
  }
  if (isNonEmptyString(value.assetId) && !assetRegistry.some((asset) => asset.id === value.assetId)) {
    issues.push(`${label} references unknown model asset "${value.assetId}".`);
    valid = false;
  }
  for (const field of ["enabled", "visible", "castShadow", "receiveShadow"] as const) {
    if (!isBoolean(value[field])) {
      issues.push(`${label} ${field} must be a boolean.`);
      valid = false;
    }
  }
  if (!validateTransform(value.transform, issues, label)) valid = false;
  return valid;
}

function validateLight(value: unknown, index: number, issues: string[]): value is SceneLight {
  const label = `Light ${index + 1}`;
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

  if (issues.length) throw new SceneConfigurationError(issues);
  return config as SceneConfiguration;
}
