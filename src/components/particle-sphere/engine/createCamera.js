import * as THREE from "three";

export const createCamera = ({
  width,
  height,
  fov = 30,
  near = 0.1,
  far = 100,
}) => {
  const camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

  camera.position.z = 5;

  return camera;
};
