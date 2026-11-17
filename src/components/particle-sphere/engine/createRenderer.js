import * as THREE from "three";

export const createRenderer = (canvas) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  renderer.setClearColor(0x000000, 0);

  return renderer;
};
