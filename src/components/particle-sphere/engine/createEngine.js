import { createRenderer } from "./createRenderer";
import { createScene } from "./createScene";
import { createCamera } from "./createCamera";
import { createSphere } from "./createSphere";
import { createAnimationLoop } from "./animationLoop";
import { disposeEngine } from "./disposeEngine";

import { createRotation } from "../animation/rotation";
import { createPointerTracker } from "../interaction/pointerTracker";
import { createPulseEffect } from "../interaction/pulseEffect";

export const createEngine = (canvas) => {
  if (!canvas) {
    throw new Error("ParticleSphere: Canvas element is required.");
  }

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (!width || !height) {
    throw new Error("ParticleSphere: Canvas has no valid dimensions.");
  }

  // Renderer
  const renderer = createRenderer(canvas);
  renderer.setSize(width, height, false);

  // Scene
  const scene = createScene();

  // Camera
  const camera = createCamera({ width, height });

  // Particles
  const { sphere, particles, geometry, material } = createSphere();
  scene.add(sphere);

  // Controllers
  const rotationController = createRotation();
  const pointerTracker = createPointerTracker(canvas);
  const pulseEffect = createPulseEffect();

  // Uniforms
  const uniforms = material.uniforms;

  uniforms.uResolution.value.set(width, height);
  uniforms.uPointer.value.set(-10, -10);

  // Animation
  const animation = createAnimationLoop({
    renderer,
    scene,
    camera,

    onUpdate: ({ deltaTime, elapsedTime }) => {
      rotationController.update(deltaTime);

      const { rotation } = rotationController;

      uniforms.uRotation.value.set(rotation.x, rotation.y);

      uniforms.uPointer.value.copy(pointerTracker.pointer);

      uniforms.uPulse.value = pulseEffect.update(deltaTime);

      uniforms.uTime.value = elapsedTime;
    },
  });

  // Pointer click
  const handleClick = () => {
    pulseEffect.trigger();
  };

  canvas.addEventListener("click", handleClick);

  // Resize
  const resize = () => {
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;

    if (!nextWidth || !nextHeight) return;

    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(nextWidth, nextHeight, false);

    uniforms.uResolution.value.set(nextWidth, nextHeight);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  // Lifecycle
  let isDisposed = false;

  const start = () => {
    if (isDisposed) return;
    animation.start();
  };

  const stop = () => {
    animation.stop();
  };

  const dispose = () => {
    if (isDisposed) return;

    isDisposed = true;

    animation.dispose();
    resizeObserver.disconnect();

    pointerTracker.dispose();
    pulseEffect.reset();

    canvas.removeEventListener("click", handleClick);

    disposeEngine({
      renderer,
      scene,
    });
  };

  return {
    renderer,
    scene,
    camera,
    sphere,
    particles,
    geometry,
    material,

    start,
    stop,
    resize,
    dispose,
  };
};
