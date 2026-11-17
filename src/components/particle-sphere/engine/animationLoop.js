import * as THREE from "three";

export const createAnimationLoop = ({ renderer, scene, camera, onUpdate }) => {
  let animationFrameId = null;
  let isRunning = false;

  const clock = new THREE.Clock();

  const animate = () => {
    if (!isRunning) return;

    animationFrameId = requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.elapsedTime;

    onUpdate?.({
      deltaTime,
      elapsedTime,
    });

    renderer.render(scene, camera);
  };

  const start = () => {
    if (isRunning) return;

    isRunning = true;
    clock.start();

    animationFrameId = requestAnimationFrame(animate);
  };

  const stop = () => {
    if (!isRunning) return;

    isRunning = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    clock.stop();
  };

  return {
    start,
    stop,
    dispose: stop,
  };
};
