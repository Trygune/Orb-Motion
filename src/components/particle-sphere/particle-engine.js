const PARTICLE_COUNT = 18000;

export const createParticles = () => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    const offset = i * 3;

    positions[offset] = Math.cos(theta) * radius;
    positions[offset + 1] = y;
    positions[offset + 2] = Math.sin(theta) * radius;

    sizes[i] = Math.random() * 0.35 + 0.15;
  }

  return {
    count: PARTICLE_COUNT,
    positions,
    sizes,
  };
};

export const rotatePoint = (x, y, z, cosX, sinX, cosY, sinY, output) => {
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;

  output.x = x1;
  output.y = y * cosX - z1 * sinX;
  output.z = y * sinX + z1 * cosX;

  return output;
};
