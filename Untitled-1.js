import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

import { createParticles } from "./particle-engine";

const DEPTH_BUCKETS = 16;
const COLOR_BINS = 8;
const GLOW_BINS = 3;

const GROUP_COUNT = DEPTH_BUCKETS * COLOR_BINS * GLOW_BINS;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const FALLOFF_STEPS = 1024;

const createFalloffTable = () => {
  const table = new Float32Array(FALLOFF_STEPS + 1);

  for (let i = 0; i <= FALLOFF_STEPS; i++) {
    const distance = Math.sqrt(i / FALLOFF_STEPS);
    const value = 1 - distance;

    table[i] = value * value * (3 - 2 * value);
  }

  return table;
};

const FALLOFF_TABLE = createFalloffTable();

export default function ParticleSphere() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const scaleValue = useMotionValue(0.85);
  const opacityValue = useMotionValue(0);

  const smoothScale = useSpring(scaleValue, {
    stiffness: 90,
    damping: 20,
  });

  const smoothOpacity = useSpring(opacityValue, {
    stiffness: 100,
    damping: 25,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !container || !ctx) return;

    const { count, positions, sizes } = createParticles();

    let width = 0;
    let height = 0;
    let frameId = 0;

    let rotationX = 0;
    let rotationY = 0;
    let time = 0;
    let pulse = 0;

    let pointerX = -1000;
    let pointerY = -1000;
    let isVisible = true;

    // Group linked lists
    const groupHeads = new Int32Array(GROUP_COUNT);
    const groupNext = new Int32Array(count);

    // Glow linked lists
    const glowHeads = new Int32Array(GLOW_BINS);
    const glowNext = new Int32Array(count);

    // Reusable particle data
    const renderData = {
      x: new Float32Array(count),
      y: new Float32Array(count),
      size: new Float32Array(count),
    };

    // Precomputed colors
    const palette = [];

    for (let glowBin = 0; glowBin < GLOW_BINS; glowBin++) {
      const glow = (glowBin + 0.5) / GLOW_BINS;

      for (let colorBin = 0; colorBin < COLOR_BINS; colorBin++) {
        const colorMix = (colorBin + 0.5) / COLOR_BINS;

        const green = Math.round(
          Math.min(255, 190 - colorMix * 105 + glow * 95),
        );

        const blue = Math.round(Math.min(255, 35 + colorMix * 5 + glow * 150));

        palette.push(`rgb(255, ${green}, ${blue})`);
      }
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();

      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointerX = -1000;
      pointerY = -1000;
    };

    const handleClick = () => {
      pulse = 1;
    };

    canvas.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(container);
    resize();

    const render = () => {
      frameId = 0;

      if (!isVisible || width === 0 || height === 0) return;

      time += 0.004;

      rotationY += 0.0018;
      rotationX += Math.sin(time * 0.5) * 0.0001;

      pulse *= 0.94;

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      const sphereRadius = Math.min(width, height) * 0.37;

      const glowRadius = sphereRadius * 0.32;
      const glowRadiusSquared = glowRadius * glowRadius;

      const pressureStrength = 0.38;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      // Reset groups
      groupHeads.fill(-1);
      glowHeads.fill(-1);

      // Project particles and build groups
      for (let i = 0; i < count; i++) {
        const offset = i * 3;

        const px = positions[offset];
        const py = positions[offset + 1];
        const pz = positions[offset + 2];

        // Rotation
        const rotatedX = px * cosY - pz * sinY;
        const rotatedZ = px * sinY + pz * cosY;

        const rotatedY = py * cosX - rotatedZ * sinX;
        const depthZ = py * sinX + rotatedZ * cosX;

        const depth = (depthZ + 1) * 0.5;

        // Perfect circular projection
        const originalX = centerX + rotatedX * sphereRadius;
        const originalY = centerY + rotatedY * sphereRadius;

        // Mouse interaction
        let influence = 0;

        if (depthZ > 0) {
          const dx = originalX - pointerX;
          const dy = originalY - pointerY;

          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared < glowRadiusSquared) {
            const normalizedDistance = distanceSquared / glowRadiusSquared;

            const tableIndex = Math.min(
              FALLOFF_STEPS,
              (normalizedDistance * FALLOFF_STEPS) | 0,
            );

            influence = FALLOFF_TABLE[tableIndex];
          }
        }

        const interaction = influence * Math.max(0, depthZ);

        const glow = interaction;
        const pressure = interaction * pressureStrength;

        // Local pressure
        const pressedZ = depthZ - pressure;
        const compression = 1 - pressure * 0.13;

        const x = centerX + rotatedX * sphereRadius * compression;

        const y = centerY + rotatedY * sphereRadius * compression;

        const size = sizes[i] * (0.65 + depth * 0.65) * (1 + glow * 0.8);

        renderData.x[i] = x;
        renderData.y[i] = y;
        renderData.size[i] = size;

        // Depth group
        const depthBin = clamp(
          Math.floor((pressedZ + 1) * 0.5 * DEPTH_BUCKETS),
          0,
          DEPTH_BUCKETS - 1,
        );

        // Color group
        const colorMix = (rotatedX + 1) * 0.5;

        const colorBin = clamp(
          Math.floor(colorMix * COLOR_BINS),
          0,
          COLOR_BINS - 1,
        );

        const glowBin = clamp(Math.floor(glow * GLOW_BINS), 0, GLOW_BINS - 1);

        const group =
          depthBin * COLOR_BINS * GLOW_BINS + glowBin * COLOR_BINS + colorBin;

        // Add particle to linked list
        groupNext[i] = groupHeads[group];
        groupHeads[group] = i;

        // Separate list for glow halos
        if (glow > 0.25) {
          glowNext[i] = glowHeads[glowBin];
          glowHeads[glowBin] = i;
        }
      }

      // Draw glow halos in batches
      for (let glowBin = 1; glowBin < GLOW_BINS; glowBin++) {
        ctx.beginPath();

        let i = glowHeads[glowBin];

        while (i !== -1) {
          const size = renderData.size[i];

          ctx.moveTo(renderData.x[i] + size * 2.5, renderData.y[i]);

          ctx.arc(renderData.x[i], renderData.y[i], size * 2.5, 0, Math.PI * 2);

          i = glowNext[i];
        }

        ctx.fillStyle = "rgb(255, 180, 45)";
        ctx.globalAlpha = glowBin === 1 ? 0.055 : 0.11;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Draw particles back to front
      for (let depthBin = 0; depthBin < DEPTH_BUCKETS; depthBin++) {
        const depth = (depthBin + 0.5) / DEPTH_BUCKETS;

        for (let glowBin = 0; glowBin < GLOW_BINS; glowBin++) {
          const glow = (glowBin + 0.5) / GLOW_BINS;

          const brightness = clamp(
            0.25 +
              depth * 0.65 +
              glow * 0.65 +
              glow * pressureStrength * 0.2 +
              pulse * 0.3,
            0,
            1,
          );

          for (let colorBin = 0; colorBin < COLOR_BINS; colorBin++) {
            const group =
              depthBin * COLOR_BINS * GLOW_BINS +
              glowBin * COLOR_BINS +
              colorBin;

            let i = groupHeads[group];

            if (i === -1) continue;

            ctx.beginPath();

            while (i !== -1) {
              const x = renderData.x[i];
              const y = renderData.y[i];
              const size = renderData.size[i];

              ctx.moveTo(x + size, y);
              ctx.arc(x, y, size, 0, Math.PI * 2);

              i = groupNext[i];
            }

            const paletteIndex = glowBin * COLOR_BINS + colorBin;

            ctx.fillStyle = palette[paletteIndex];
            ctx.globalAlpha = brightness;
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;

      frameId = requestAnimationFrame(render);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible && !frameId) {
        frameId = requestAnimationFrame(render);
      }
    });

    visibilityObserver.observe(canvas);

    scaleValue.set(1);
    opacityValue.set(1);

    render();

    return () => {
      cancelAnimationFrame(frameId);

      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);

      scaleValue.set(0.85);
      opacityValue.set(0);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <motion.div
        style={{
          scale: smoothScale,
          opacity: smoothOpacity,
        }}
        className="absolute inset-0"
      >
        <canvas ref={canvasRef} className="h-full w-full cursor-pointer" />
      </motion.div>
    </div>
  );
}
