"use client";

import { useParticleSphere } from "./hooks/useParticleSphere";
import SphereCanvas from "./ui/SphereCanvas";

const ParticleSphere = ({ className = "", enabled = true, onReady }) => {
  const { canvasRef } = useParticleSphere({
    enabled,
    onReady,
  });

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <SphereCanvas ref={canvasRef} />
    </div>
  );
};

export default ParticleSphere;
