import React, { Suspense } from "react";
import { Canvas as ThreeCanvas } from "@react-three/fiber";
import LoadingScreen from "../components/LoadingScreen";

export default function Canvas({ children, ...props }: any) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ThreeCanvas
        className="w-full h-full bg-[var(--bg-color)]"
        dpr={dpr}
        frameloop="demand"
        {...props}
      >
        {children}
      </ThreeCanvas>
    </Suspense>
  );
}
