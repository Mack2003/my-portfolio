import type { SceneObjectPresetAnimation } from "../config/sceneTypes";
import { bounceAnimation } from "./presets/bounce";
import { bowSwingAnimation } from "./presets/bowSwing";
import { floatingHoverAnimation } from "./presets/floatingHover";
import { pulseAnimation } from "./presets/pulse";
import { rotateAnimation } from "./presets/rotate";
import { violinSwayAnimation } from "./presets/violinSway";
import type {
  AnimationContext,
  PresetAnimationHandler,
  PresetAnimationMeta,
} from "./types";

export * from "./types";
export {
  bounceAnimation,
  bowSwingAnimation,
  floatingHoverAnimation,
  pulseAnimation,
  rotateAnimation,
  violinSwayAnimation,
};

/**
 * Registry mapping preset identifiers to their implementation handlers.
 */
export const PRESET_ANIMATIONS: Record<
  SceneObjectPresetAnimation,
  PresetAnimationHandler
> = {
  pulse: pulseAnimation,
  bounce: bounceAnimation,
  rotate: rotateAnimation,
  "violin-sway": violinSwayAnimation,
  "floating-hover": floatingHoverAnimation,
  "bow-swing": bowSwingAnimation,
  "bow-stroke": bowSwingAnimation,
};

/**
 * UI options metadata for selecting presets in the editor.
 */
export const PRESET_ANIMATION_OPTIONS: readonly PresetAnimationMeta[] = [
  {
    id: "pulse",
    label: "Pulse",
    description: "Smooth pulsing scale animation",
  },
  {
    id: "bounce",
    label: "Bounce",
    description: "Vertical bobbing bounce",
  },
  {
    id: "rotate",
    label: "Rotate",
    description: "Continuous 360-degree rotation",
  },
  {
    id: "violin-sway",
    label: "Violin sway",
    description: "Gentle rhythmic musical sway",
  },
  {
    id: "floating-hover",
    label: "Floating hover",
    description: "Gentle floating levitation with subtle tilt",
  },
  {
    id: "bow-swing",
    label: "Bow swinging",
    description: "Expressive violin bow stroke with musical voice note phrasing",
  },
] as const;

/**
 * Execute the registered preset animation for an object.
 */
export function applyPresetAnimation(
  preset: SceneObjectPresetAnimation,
  context: AnimationContext,
): void {
  const handler = PRESET_ANIMATIONS[preset];
  if (handler) {
    handler(context);
  }
}
