import { useEffect, useRef } from "react";

import { createEngine } from "../engine/createEngine";

export const useParticleSphere = ({ enabled = true, onReady } = {}) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !enabled) return;

    let isDisposed = false;

    const initialize = () => {
      try {
        const engine = createEngine(canvas);

        if (isDisposed) {
          engine.dispose();
          return;
        }

        engineRef.current = engine;

        engine.start();

        onReady?.();
      } catch (error) {
        console.error("ParticleSphere initialization failed:", error);
      }
    };

    initialize();

    return () => {
      isDisposed = true;

      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [enabled, onReady]);

  return {
    canvasRef,
    engineRef,
  };
};
