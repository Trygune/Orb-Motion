export const PARTICLE_CONFIG = {
  count: 36000,

  sphere: {
    radius: 1,
  },

  size: {
    min: 0.15,
    max: 0.5,
  },

  distribution: {
    goldenAngle: Math.PI * (3 - Math.sqrt(5)),
  },

  rendering: {
    pixelRatio: 1.5,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  },
};

export const PARTICLE_COUNT = PARTICLE_CONFIG.count;
