import * as THREE from "three";

export const createPointerTracker = (element) => {
  const pointer = new THREE.Vector2(-10, -10);

  let isInside = false;

  const update = (event) => {
    const rect = element.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    pointer.set(x * 2 - 1, -(y * 2 - 1));

    isInside = true;
  };

  const reset = () => {
    pointer.set(-10, -10);
    isInside = false;
  };

  const handlePointerMove = (event) => {
    update(event);
  };

  const handlePointerLeave = () => {
    reset();
  };

  element.addEventListener("pointermove", handlePointerMove, { passive: true });

  element.addEventListener("pointerleave", handlePointerLeave);

  const dispose = () => {
    element.removeEventListener("pointermove", handlePointerMove);

    element.removeEventListener("pointerleave", handlePointerLeave);

    reset();
  };

  return {
    pointer,
    get isInside() {
      return isInside;
    },
    update,
    reset,
    dispose,
  };
};
