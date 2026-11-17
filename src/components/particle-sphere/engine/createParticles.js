import * as THREE from "three";

import { createParticleGeometry } from "../particles/particleGeometry";
import { createParticleMaterial } from "../particles/particleMaterial";

export const createParticles = () => {
  const geometry = createParticleGeometry();
  const material = createParticleMaterial();

  const particles = new THREE.Points(geometry, material);

  particles.frustumCulled = false;

  return {
    particles,
    geometry,
    material,
  };
};
