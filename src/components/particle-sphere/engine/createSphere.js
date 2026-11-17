import * as THREE from "three";

import { createParticles } from "./createParticles";

export const createSphere = () => {
  const sphere = new THREE.Group();

  const { particles, geometry, material } = createParticles();

  sphere.add(particles);

  return {
    sphere,
    particles,
    geometry,
    material,
  };
};
