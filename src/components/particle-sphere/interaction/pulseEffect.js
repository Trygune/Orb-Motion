import { MOTION_CONFIG } from "../animation/motionConfig";

const { initialStrength, decay } = MOTION_CONFIG.pulse;

export const createPulseEffect = () => {
  let intensity = 0;
  let enabled = true;

  const trigger = () => {
    if (!enabled) return;

    intensity = initialStrength;
  };

  const update = (deltaTime) => {
    if (!enabled) return 0;

    intensity *= Math.pow(decay, deltaTime * 60);

    if (intensity < 0.001) {
      intensity = 0;
    }

    return intensity;
  };

  const reset = () => {
    intensity = 0;
  };

  const setEnabled = (value) => {
    enabled = Boolean(value);

    if (!enabled) {
      reset();
    }
  };

  return {
    trigger,
    update,
    reset,
    setEnabled,

    get intensity() {
      return intensity;
    },
  };
};
