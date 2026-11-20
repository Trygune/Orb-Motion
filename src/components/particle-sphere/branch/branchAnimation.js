import * as THREE from "three";

import { BRANCH_CONFIG } from "./branchConfig";
import { noise1D, noise2D } from "./branchNoise";

// ---------------------------------------------
// Branch Animation
// ---------------------------------------------

export const createBranchAnimation = (branchData) => {
  const {
    outerRadius,
    movement,
    wave,
    bend,
    geometry: geometryConfig,
  } = BRANCH_CONFIG;

  const { segments, radialSegments } = geometryConfig;

  let animationTime = 0;

  const updateBranches = (deltaTime = 0) => {
    const dt = THREE.MathUtils.clamp(
      Number.isFinite(deltaTime) ? deltaTime : 0,
      0,
      0.05,
    );

    animationTime += dt;

    for (const data of branchData) {
      const {
        geometry,
        start,
        direction,
        tangent,
        secondAxis,
        movementSeed,
        waveSeed,
        bendSeed,
      } = data;

      // ---------------------------------------
      // 1. Outer movement
      // ---------------------------------------

      const moveX = noise1D(animationTime * movement.speed, movementSeed);

      const moveY = noise1D(
        animationTime * movement.speed * 0.73,
        movementSeed + 41.7,
      );

      const currentDirection = direction
        .clone()
        .addScaledVector(tangent, moveX * movement.radius)
        .addScaledVector(secondAxis, moveY * movement.radius)
        .normalize();

      const end = currentDirection.clone().multiplyScalar(outerRadius);

      // ---------------------------------------
      // 2. Continuous bending
      // ---------------------------------------

      const bendX = noise1D(animationTime * bend.speed, bendSeed);

      const bendY = noise1D(animationTime * bend.speed * 0.81, bendSeed + 19.3);

      const curve = new THREE.QuadraticBezierCurve3(
        start,
        start.clone().lerp(end, 0.5),
        end,
      );

      // ---------------------------------------
      // 3. Tube deformation
      // ---------------------------------------

      const positions = geometry.attributes.position;

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;

        const point = curve.getPointAt(t);

        const curveTangent = curve.getTangentAt(t).normalize();

        // Gradual bending from start to end
        const bendEnvelope = t * t;

        const bendAmount = bendEnvelope * bend.amplitude;

        point
          .addScaledVector(tangent, bendX * bendAmount)
          .addScaledVector(secondAxis, bendY * bendAmount);

        // -------------------------------------
        // 4. Stable tube frame
        // -------------------------------------

        const normal = tangent
          .clone()
          .addScaledVector(curveTangent, -tangent.dot(curveTangent));

        if (normal.lengthSq() < 0.000001) {
          normal
            .copy(secondAxis)
            .addScaledVector(curveTangent, -secondAxis.dot(curveTangent));
        }

        normal.normalize();

        const binormal = new THREE.Vector3()
          .crossVectors(curveTangent, normal)
          .normalize();

        // -------------------------------------
        // 5. Organic traveling deformation
        // -------------------------------------

        const wave1 = noise2D(
          t * wave.frequency * 3,
          animationTime * wave.speed,
          waveSeed,
        );

        const wave2 = noise2D(
          t * wave.frequency * 4.2 + 17,
          animationTime * wave.speed * 1.35,
          waveSeed + 73.1,
        );

        const wave3 = noise2D(
          t * wave.frequency * 2.1 + 31,
          animationTime * wave.speed * 0.65,
          waveSeed + 127.4,
        );

        const envelope = Math.sin(Math.PI * t);

        const waveA =
          (wave1 * 0.55 + wave2 * 0.3 + wave3 * 0.15) *
          envelope *
          wave.amplitude;

        const waveB =
          noise2D(
            t * wave.frequency * 3.4 + 53,
            animationTime * wave.speed * 0.8,
            waveSeed + 211.8,
          ) *
          envelope *
          wave.amplitude *
          0.55;

        point.addScaledVector(normal, waveA).addScaledVector(binormal, waveB);

        // -------------------------------------
        // 6. Tapered thickness
        // -------------------------------------

        const branchRadius = 0.035 * Math.pow(1 - t, 1.2) + 0.0015;

        for (let k = 0; k < radialSegments; k++) {
          const angle = (k / radialSegments) * Math.PI * 2;

          const radialOffset = normal
            .clone()
            .multiplyScalar(Math.cos(angle) * branchRadius)
            .add(
              binormal.clone().multiplyScalar(Math.sin(angle) * branchRadius),
            );

          const index = j * radialSegments + k;

          positions.setXYZ(
            index,
            point.x + radialOffset.x,
            point.y + radialOffset.y,
            point.z + radialOffset.z,
          );
        }
      }

      positions.needsUpdate = true;

      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
    }
  };

  // Initialize before first frame
  updateBranches(0);

  return updateBranches;
};
