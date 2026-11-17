import { MOTION_CONFIG } from "./motionConfig";

export const createRotation = ({
  speedX = MOTION_CONFIG.rotation.speedX,
  speedY = MOTION_CONFIG.rotation.speedY,
  speedZ = MOTION_CONFIG.rotation.speedZ,
} = {}) => {
  const rotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  const update = (deltaTime) => {
    const frameScale = deltaTime * 60;

    rotation.x += speedX * frameScale;
    rotation.y += speedY * 0.001 * frameScale;
    rotation.z += speedZ * 0.001 * frameScale;
  };

  const reset = () => {
    rotation.x = 0;
    rotation.y = 0;
    rotation.z = 0;
  };

  return {
    rotation,
    update,
    reset,
  };
};
