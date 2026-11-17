
uniform float uPixelRatio;
uniform vec2 uRotation;
uniform vec2 uPointer;
uniform vec2 uResolution;
uniform float uTime;
uniform float uPulse;

attribute float aSize;

varying float vDepth;
varying float vColorMix;
varying float vGlow;
varying float vPulse;

const float PRESSURE_RADIUS = 0.42;
const float PRESSURE_STRENGTH = 0.38;

const float GLOW_RADIUS = 0.42;
const float GLOW_STRENGTH = 0.8;

float smoothFalloff(float distanceValue, float radius) {
  float normalized = 1.0 - clamp(distanceValue / radius, 0.0, 1.0);
  return normalized * normalized * (3.0 - 2.0 * normalized);
}

void main() {
  vec3 particlePosition = position;

  // Rotation
  float cosY = cos(uRotation.y);
  float sinY = sin(uRotation.y);

  float rotatedX = particlePosition.x * cosY - particlePosition.z * sinY;
  float rotatedZ = particlePosition.x * sinY + particlePosition.z * cosY;

  float cosX = cos(uRotation.x);
  float sinX = sin(uRotation.x);

  float rotatedY = particlePosition.y * cosX - rotatedZ * sinX;
  float depthZ = particlePosition.y * sinX + rotatedZ * cosX;

  vec3 rotatedPosition = vec3(rotatedX, rotatedY, depthZ);

  // Original projected position
  vec4 modelPosition = modelViewMatrix * vec4(rotatedPosition, 1.0);
  vec4 projectedPosition = projectionMatrix * modelPosition;

  vec2 screenPosition = projectedPosition.xy / projectedPosition.w;

  // Pointer distance in pixel space
  vec2 pointerDelta = (screenPosition - uPointer) * uResolution * 0.5;
  float pointerDistance = length(pointerDelta);

  // Match Canvas sphere radius: min(width, height) * 0.37
  float sphereRadius = min(uResolution.x, uResolution.y) * 0.37;

  float pressureRadius = sphereRadius * PRESSURE_RADIUS;
  float glowRadius = sphereRadius * GLOW_RADIUS;

  // Only front-facing particles react
  float frontDepth = max(depthZ, 0.0);

  float pressureInfluence = smoothFalloff(pointerDistance, pressureRadius);
  pressureInfluence *= frontDepth;

  float glowInfluence = smoothFalloff(pointerDistance, glowRadius);
  glowInfluence *= frontDepth;

  // Pressure
  float pressure = pressureInfluence * PRESSURE_STRENGTH;

  rotatedPosition.xy *= 1.0 - pressure * 0.13;
  rotatedPosition.z -= pressure;

  // Recalculate final position
  modelPosition = modelViewMatrix * vec4(rotatedPosition, 1.0);
  projectedPosition = projectionMatrix * modelPosition;

  gl_Position = projectedPosition;

  // Particle attributes
  vDepth = clamp((depthZ + 1.0) * 0.5, 0.0, 1.0);
  vColorMix = clamp((rotatedX + 1.0) * 0.5, 0.0, 1.0);

  vGlow = glowInfluence * GLOW_STRENGTH;
  vPulse = uPulse;

  // Particle size
  float depthScale = mix(0.65, 1.3, vDepth);
  float glowScale = 1.0 + vGlow * 0.8;

  gl_PointSize = aSize * depthScale * glowScale *
    uPixelRatio * (18.0 / max(-modelPosition.z, 0.1));

  gl_PointSize = clamp(gl_PointSize, 0.65, 1.25);
}
