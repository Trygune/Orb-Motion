import * as THREE from "three";

import { PARTICLE_CONFIG } from "./particleConfig";

export const createParticleGeometry = () => {
  const { count, sphere, size, distribution } = PARTICLE_CONFIG;

  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;

    const radius = Math.sqrt(1 - y * y);
    const theta = distribution.goldenAngle * i;

    const offset = i * 3;

    positions[offset] = Math.cos(theta) * radius * sphere.radius;

    positions[offset + 1] = y * sphere.radius;

    positions[offset + 2] = Math.sin(theta) * radius * sphere.radius;

    sizes[i] = Math.random() * (size.max - size.min) + size.min;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  return geometry;
};
