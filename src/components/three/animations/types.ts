import type { Group, Vector3 } from "three";
import type { SceneObjectPresetAnimation } from "../config/sceneTypes";

export type AnimationContext = {
  group: Group;
  basePosition: Vector3;
  baseRotation: Vector3;
  baseScale: [number, number, number];
  elapsedTime: number;
  timeScale: number;
  delta: number;
};

export type PresetAnimationHandler = (context: AnimationContext) => void;

export type PresetAnimationMeta = {
  id: SceneObjectPresetAnimation;
  label: string;
  description: string;
};
