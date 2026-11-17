import { forwardRef } from "react";

const SphereCanvas = forwardRef(function SphereCanvas({ className = "" }, ref) {
  return (
    <canvas
      ref={ref}
      className={`block h-full w-full ${className}`}
      aria-label="Interactive particle sphere"
    />
  );
});

export default SphereCanvas;
