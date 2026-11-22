import type { PresetAnimationHandler } from "../types";

/**
 * Smooth floating hover levitation animation: subtle vertical sine wave
 * with gentle tilting on X and Z axes.
 */
export const floatingHoverAnimation: PresetAnimationHandler = ({
  group,
  basePosition,
  baseRotation,
  elapsedTime,
  timeScale,
}) => {
  const time = elapsedTime * timeScale;
  group.position.set(
    basePosition.x,
    basePosition.y + Math.sin(time * 2) * 0.06,
    basePosition.z,
  );
  group.rotation.set(
    baseRotation.x + Math.sin(time * 1.5) * 0.03,
    baseRotation.y,
    baseRotation.z + Math.cos(time * 1.8) * 0.03,
  );
};
