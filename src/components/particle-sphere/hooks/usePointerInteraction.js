import { useCallback, useEffect, useRef } from "react";

import { createPointerTracker } from "../interaction/pointerTracker";
import { createPressureEffect } from "../interaction/pressureEffect";
import { createGlowEffect } from "../interaction/glowEffect";
import { createPulseEffect } from "../interaction/pulseEffect";

export const usePointerInteraction = ({ elementRef, enabled = true } = {}) => {
  const interactionRef = useRef(null);

  useEffect(() => {
    const element = elementRef?.current;

    if (!element || !enabled) return;

    const pointerTracker = createPointerTracker(element);
    const pressureEffect = createPressureEffect();
    const glowEffect = createGlowEffect();
    const pulseEffect = createPulseEffect();

    const handleClick = () => {
      pulseEffect.trigger();
    };

    element.addEventListener("click", handleClick);

    interactionRef.current = {
      pointerTracker,
      pressureEffect,
      glowEffect,
      pulseEffect,
    };

    return () => {
      element.removeEventListener("click", handleClick);

      pointerTracker.dispose();
      pressureEffect.reset();
      glowEffect.reset();
      pulseEffect.reset();

      interactionRef.current = null;
    };
  }, [elementRef, enabled]);

  const getPointer = useCallback(() => {
    const interaction = interactionRef.current;

    if (!interaction) return null;

    return {
      position: interaction.pointerTracker.pointer,
      isInside: interaction.pointerTracker.isInside,
    };
  }, []);

  const updateEffects = useCallback(({ distance, depth, deltaTime }) => {
    const interaction = interactionRef.current;

    if (!interaction) {
      return {
        pressure: 0,
        glow: 0,
        pulse: 0,
      };
    }

    return {
      pressure: interaction.pressureEffect.update({
        distance,
        depth,
      }),

      glow: interaction.glowEffect.update({
        distance,
        depth,
      }),

      pulse: interaction.pulseEffect.update(deltaTime),
    };
  }, []);

  const triggerPulse = useCallback(() => {
    interactionRef.current?.pulseEffect.trigger();
  }, []);

  return {
    interactionRef,
    getPointer,
    updateEffects,
    triggerPulse,
  };
};
