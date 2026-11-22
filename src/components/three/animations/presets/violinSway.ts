import type { PresetAnimationHandler } from "../types";

/**
 * Gentle rhythmic swaying animation designed for the violin or expressive objects.
 */
export const violinSwayAnimation: PresetAnimationHandler = ({
  group,
  baseRotation,
  elapsedTime,
  timeScale,
}) => {
  const time = elapsedTime * timeScale;
  group.rotation.set(
    baseRotation.x,
    baseRotation.y + Math.sin(time * 2.2) * 0.08,
    baseRotation.z + Math.sin(time * 1.8) * 0.05,
  );
};
