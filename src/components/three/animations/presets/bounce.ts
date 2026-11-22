import type { PresetAnimationHandler } from "../types";

/**
 * Bouncing position animation: vertical bobbing motion.
 */
export const bounceAnimation: PresetAnimationHandler = ({
  group,
  basePosition,
  elapsedTime,
  timeScale,
}) => {
  const time = elapsedTime * timeScale;
  group.position.set(
    basePosition.x,
    basePosition.y + Math.abs(Math.sin(time * 2.5)) * 0.18,
    basePosition.z,
  );
};
