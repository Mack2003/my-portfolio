import type { PresetAnimationHandler } from "../types";

/**
 * Continuous rotation animation around the Y-axis.
 */
export const rotateAnimation: PresetAnimationHandler = ({
  group,
  baseRotation,
  elapsedTime,
  timeScale,
}) => {
  const time = elapsedTime * timeScale;
  group.rotation.set(
    baseRotation.x,
    baseRotation.y + time,
    baseRotation.z,
  );
};
