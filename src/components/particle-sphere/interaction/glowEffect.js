import { MOTION_CONFIG } from "../animation/motionConfig";

const { radius, intensity, strength } = MOTION_CONFIG.glow;

export const calculateGlow = ({ distance, depth }) => {
  if (depth <= 0 || distance >= radius) {
    return 0;
  }

  const normalizedDistance = 1 - distance / radius;

  const influence =
    normalizedDistance * normalizedDistance * (3 - 2 * normalizedDistance);

  return influence * depth * intensity * strength;
};

export const createGlowEffect = () => {
  let enabled = true;

  const update = ({ distance, depth }) => {
    if (!enabled) return 0;

    return calculateGlow({
      distance,
      depth,
    });
  };

  const setEnabled = (value) => {
    enabled = Boolean(value);
  };

  const reset = () => {
    enabled = true;
  };

  return {
    update,
    setEnabled,
    reset,
  };
};
