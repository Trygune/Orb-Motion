import * as THREE from "three";

import vertexShader from "../shaders/particle.vert?raw";
import fragmentShader from "../shaders/particle.frag?raw";

import { PARTICLE_CONFIG } from "./particleConfig";

export const createParticleMaterial = () => {
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    PARTICLE_CONFIG.rendering.pixelRatio,
  );

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,

    transparent: PARTICLE_CONFIG.rendering.transparent,
    depthWrite: PARTICLE_CONFIG.rendering.depthWrite,
    depthTest: PARTICLE_CONFIG.rendering.depthTest,

    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uRotation: { value: new THREE.Vector2(0, 0) },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPulse: { value: 0 },
      uTime: { value: 0 },
    },
  });
};
