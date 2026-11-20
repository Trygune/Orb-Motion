import * as THREE from "three";

// ---------------------------------------------
// Helpers
// ---------------------------------------------

export const fade = (t) => {
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const fract = (value) => {
  return value - Math.floor(value);
};

// ---------------------------------------------
// Hash
// ---------------------------------------------

export const hash2D = (x, y, seed) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;

  return fract(value) * 2 - 1;
};

// ---------------------------------------------
// 2D Smooth Noise
// ---------------------------------------------

export const noise2D = (x, y, seed) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);

  const tx = fade(x - ix);
  const ty = fade(y - iy);

  const a = THREE.MathUtils.lerp(
    hash2D(ix, iy, seed),
    hash2D(ix + 1, iy, seed),
    tx,
  );

  const b = THREE.MathUtils.lerp(
    hash2D(ix, iy + 1, seed),
    hash2D(ix + 1, iy + 1, seed),
    tx,
  );

  return THREE.MathUtils.lerp(a, b, ty);
};

// ---------------------------------------------
// 1D Smooth Noise
// ---------------------------------------------

export const noise1D = (x, seed) => {
  const ix = Math.floor(x);
  const t = fade(x - ix);

  const a = hash2D(ix, 0, seed);
  const b = hash2D(ix + 1, 0, seed);

  return THREE.MathUtils.lerp(a, b, t);
};
