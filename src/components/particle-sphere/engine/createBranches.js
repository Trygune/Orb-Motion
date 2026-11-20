import * as THREE from "three";

import { BRANCH_CONFIG } from "../branch/branchConfig";
import { createBranchGeometry } from "../branch/branchGeometry";
import { createBranchMaterial } from "../branch/branchMaterial";
import { createBranchAnimation } from "../branch/branchAnimation";

// ---------------------------------------------
// Branch Creation
// ---------------------------------------------

export const createBranches = () => {
  const branches = new THREE.Group();

  const material = createBranchMaterial();

  const branchData = [];

  const { coreRadius, count } = BRANCH_CONFIG;

  // -------------------------------------------
  // Create branches
  // -------------------------------------------

  for (let i = 0; i < count; i++) {
    // Distribute branches around the sphere
    const y = 1 - (i / (count - 1)) * 2;

    const radius = Math.sqrt(1 - y * y);

    const angle = i * Math.PI * (3 - Math.sqrt(5));

    const direction = new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    ).normalize();

    const start = direction.clone().multiplyScalar(coreRadius);

    // Local coordinate system
    const referenceAxis =
      Math.abs(direction.y) < 0.9
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

    const tangent = new THREE.Vector3()
      .crossVectors(direction, referenceAxis)
      .normalize();

    const secondAxis = new THREE.Vector3()
      .crossVectors(direction, tangent)
      .normalize();

    const geometry = createBranchGeometry();

    const branch = new THREE.Mesh(geometry, material);

    branch.frustumCulled = false;

    branches.add(branch);

    branchData.push({
      geometry,
      start,
      direction,
      tangent,
      secondAxis,

      movementSeed: Math.random() * 1000,
      waveSeed: Math.random() * 1000,
      bendSeed: Math.random() * 1000,
    });
  }

  // -------------------------------------------
  // Animation
  // -------------------------------------------

  const updateBranches = createBranchAnimation(branchData);

  return {
    branches,
    updateBranches,
  };
};
