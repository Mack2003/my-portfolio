import type { SceneConfiguration } from "./sceneTypes";
import { validateSceneConfiguration } from "./sceneValidation";

export function serializeSceneConfiguration(configuration: SceneConfiguration): string {
  return JSON.stringify(validateSceneConfiguration(configuration), null, 2);
}

export function parseSceneConfiguration(source: string): SceneConfiguration {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Configuration is not valid JSON: ${error.message}`);
    }
    throw error;
  }
  return validateSceneConfiguration(parsed);
}
