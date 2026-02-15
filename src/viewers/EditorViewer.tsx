import React, { useRef } from "react";
import { observer } from "mobx-react";
import { useFrame } from "@react-three/fiber";

import Canvas from "./Canvas";
import Controls from "../components-3d/Controls";
import ShapeGeometry from "../components-3d/ShapeGeometry";
import DefaultGeometry from "../components-3d/DefaultGeometry";
import InfiniteGrid from "../components-3d/InfiniteGrid";

function CameraLight() {
  const lightRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
    }
  });

  return <directionalLight ref={lightRef} intensity={1.5} />;
}

export default observer(function EditorViewer({
  stl,
  hasError,
  clipDirection,
  clipConstant,
}: {
  stl: Uint8Array | null;
  hasError: boolean;
  clipDirection?: number[];
  clipConstant?: number;
}) {
  return (
    <Canvas
      orthographic
      onCreated={(state: any) => (state.gl.localClippingEnabled = true)}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, -10, 10]} intensity={0.8} />
      <directionalLight position={[-10, 10, 5]} intensity={0.4} />
      <CameraLight />

      <InfiniteGrid />

      <Controls enableDamping={false}>
        {hasError || !stl ? (
          <DefaultGeometry />
        ) : (
          <ShapeGeometry
            stl={stl}
            clipDirection={clipDirection}
            clipConstant={clipConstant}
          />
        )}
      </Controls>
    </Canvas>
  );
});
