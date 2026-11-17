import * as THREE from "three";

export const createScene = () => {
  const scene = new THREE.Scene();

  scene.background = null;

  return scene;
};
