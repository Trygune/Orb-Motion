import * as THREE from "three";

// ---------------------------------------------
// Branch Material
// ---------------------------------------------

export const createBranchMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0.12 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,

    vertexShader: `
      attribute float aProgress;
      varying float vProgress;

      void main() {
        vProgress = aProgress;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    `,

    fragmentShader: `
uniform float uOpacity;

varying float vProgress;

void main() {
  vec3 coreColor = vec3(1.0, 0.48, 0.12);
  vec3 middleColor = vec3(1.0, 0.68, 0.08);
  vec3 outerColor = vec3(1.0, 0.88, 0.08);

  vec3 color = mix(
    coreColor,
    middleColor,
    smoothstep(0.0, 0.55, vProgress)
  );

  color = mix(
    color,
    outerColor,
    smoothstep(0.45, 1.0, vProgress)
  );

  gl_FragColor = vec4(color, uOpacity);
}
    `,
  });
};
