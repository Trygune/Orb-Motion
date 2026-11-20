import * as THREE from "three";

import { BRANCH_CONFIG } from "./branchConfig";

// ---------------------------------------------
// Tube Geometry
// ---------------------------------------------

export const createBranchGeometry = () => {
  const { segments, radialSegments } = BRANCH_CONFIG.geometry;

  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array((segments + 1) * radialSegments * 3);

  const progress = [];
  const indices = [];

  // Progress attribute
  for (let j = 0; j <= segments; j++) {
    const t = j / segments;

    for (let k = 0; k < radialSegments; k++) {
      progress.push(t);
    }
  }

  // Indices
  for (let j = 0; j < segments; j++) {
    for (let k = 0; k < radialSegments; k++) {
      const a = j * radialSegments + k;
      const b = j * radialSegments + ((k + 1) % radialSegments);
      const c = (j + 1) * radialSegments + k;
      const d = (j + 1) * radialSegments + ((k + 1) % radialSegments);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute(
    "aProgress",
    new THREE.Float32BufferAttribute(progress, 1),
  );

  geometry.setIndex(indices);

  return geometry;
};
