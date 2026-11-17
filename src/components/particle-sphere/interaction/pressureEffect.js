import { MOTION_CONFIG } from "../animation/motionConfig";

const { radius, strength, falloff } = MOTION_CONFIG.pressure;

export const calculatePressure = ({ distance, depth }) => {
  if (depth <= 0 || distance >= radius) {
    return 0;
  }

  const normalizedDistance = 1 - distance / radius;

  const influence = Math.pow(normalizedDistance, falloff);

  return influence * depth * strength;
};

export const createPressureEffect = () => {
  let enabled = true;

  const update = ({ distance, depth }) => {
    if (!enabled) return 0;

    return calculatePressure({
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
