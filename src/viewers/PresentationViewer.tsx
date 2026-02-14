import React from "react";

import Canvas from "./Canvas";
import Material from "./Material";

import Controls from "../components-3d/Controls";
import { ShapeGeometries } from "../components-3d/ShapeGeometry";
import DefaultGeometry from "../components-3d/DefaultGeometry";
import InfiniteGrid from "../components-3d/InfiniteGrid";

export default React.memo(function PresentationViewer({
  shapes,
  disableAutoPosition = false,
  disableDamping = false,
  hideGrid = false,
  orthographicCamera = false,
}) {
  const geometryReady = shapes && shapes.length && shapes[0].name;

  return (
    <Canvas orthographic={orthographicCamera}>
      {!hideGrid && <InfiniteGrid />}
      <Controls hideGizmo={!geometryReady} enableDamping={!disableDamping}>
        {shapes !== "error" && shapes.length && (
          <ShapeGeometries
            shapes={shapes}
            selectMode="none"
            disableAutoPosition={disableAutoPosition}
            FaceMaterial={Material}
          />
        )}
        {shapes === "error" && <DefaultGeometry />}
      </Controls>
    </Canvas>
  );
});
