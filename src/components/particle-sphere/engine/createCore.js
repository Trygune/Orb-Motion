import * as THREE from "three";

export const createCore = () => {
  const geometry = new THREE.SphereGeometry(1, 96, 96);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,

    uniforms: {
      uTime: { value: 0 },
      uColor: {
        value: new THREE.Color("#ffd34f"),
      },
    },

    vertexShader: `
      uniform float uTime;

      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 pos = position;
        vec3 normalDir = normalize(normal);

        // Organic deformation
        float wave1 = sin(pos.x * 5.0 + uTime * 0.8);
        float wave2 = sin(pos.y * 4.0 - uTime * 0.65);
        float wave3 = sin(pos.z * 6.0 + uTime * 0.45);

        float distortion =
          wave1 * 0.025 +
          wave2 * 0.018 +
          wave3 * 0.012;

        pos += normalDir * distortion;

        vPosition = pos;
        vNormal = normalize(normalMatrix * normalDir);

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(pos, 1.0);
      }
    `,

    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;

      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 normalDir = normalize(vNormal);

        // Organic surface variation
        vec3 p = normalize(vPosition);

        float wave1 = sin(p.x * 5.0 + uTime * 0.8);
        float wave2 = sin(p.y * 4.0 - uTime * 0.65);
        float wave3 = sin(p.z * 6.0 + uTime * 0.45);

        float organic =
          wave1 * 0.15 +
          wave2 * 0.12 +
          wave3 * 0.08;

        // Lighting
        vec3 lightDirection = normalize(vec3(-0.5, 0.7, 1.0));

        float diffuse = max(
          dot(normalDir, lightDirection),
          0.0
        );

        float light = 0.35 + diffuse * 0.65;

        // Color gradient
        vec3 centerColor = vec3(1.0, 0.98, 0.62);
        vec3 middleColor = vec3(1.0, 0.82, 0.25);
        vec3 edgeColor = vec3(1.0, 0.48, 0.12);

        float gradient = smoothstep(0.0, 1.0, length(vPosition) * 0.9);

        vec3 finalColor = mix(
          centerColor,
          middleColor,
          gradient
        );

        finalColor = mix(
          finalColor,
          edgeColor,
          gradient * 0.65
        );

        finalColor *= light + organic * 0.15;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });

  const core = new THREE.Mesh(geometry, material);

  core.position.set(0, 0, 0);
  core.scale.setScalar(0.1);

  return {
    core,
    geometry,
    material,
  };
};
