
uniform float uTime;

varying float vDepth;
varying float vColorMix;
varying float vGlow;
varying float vPulse;

void main() {
  vec2 centeredCoord = gl_PointCoord - vec2(0.5);
  float distanceFromCenter = length(centeredCoord);

  if (distanceFromCenter > 0.5) {
    discard;
  }

  // Particle core
  float core = 1.0 - smoothstep(0.12, 0.42, distanceFromCenter);

  // Layered golden halo
  float innerGlow = 1.0 - smoothstep(0.0, 0.24, distanceFromCenter);
  float middleGlow = 1.0 - smoothstep(0.12, 0.40, distanceFromCenter);
  float outerGlow = 1.0 - smoothstep(0.28, 0.5, distanceFromCenter);

  // Reconstruct original Canvas palette
  float colorMix = floor(vColorMix * 8.0) / 8.0;
  float glowLevel = floor(clamp(vGlow, 0.0, 1.0) * 3.0) / 3.0;

  float green = min(1.0, (190.0 - colorMix * 105.0 + glowLevel * 95.0) / 255.0);
  float blue = min(1.0, (35.0 + colorMix * 5.0 + glowLevel * 150.0) / 255.0);

  vec3 particleColor = vec3(1.0, green, blue);

  // Depth brightness
  float brightness = clamp(
    0.25 +
    vDepth * 0.65 +
    glowLevel * 0.65 +
    glowLevel * 0.38 * 0.2 +
    vPulse * 0.3,
    0.0,
    1.0
  );

  // Glow light
  vec3 glowColor = vec3(1.0, 0.70, 0.18);

  particleColor += glowColor * vGlow * innerGlow * 0.55;

  // Pulse light
  particleColor += vec3(1.0, 0.65, 0.2) * vPulse * 0.3;

  // Core and halo opacity
  float coreOpacity = core * brightness;

  float haloOpacity =
    middleGlow * vGlow * 0.18 +
    outerGlow * vGlow * 0.08;

  float opacity = clamp(coreOpacity + haloOpacity, 0.0, 1.0);

  gl_FragColor = vec4(particleColor, opacity);
}
