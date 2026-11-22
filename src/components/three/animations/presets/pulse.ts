import type { PresetAnimationHandler } from "../types";

/**
 * Pulsing scale animation: smoothly expands and contracts the object.
 */
export const pulseAnimation: PresetAnimationHandler = ({
  group,
  baseScale,
  elapsedTime,
  timeScale,
}) => {
  const time = elapsedTime * timeScale;
  const pulse = 1 + Math.sin(time * 3) * 0.08;
  group.scale.set(
    baseScale[0] * pulse,
    baseScale[1] * pulse,
    baseScale[2] * pulse,
  );
};
