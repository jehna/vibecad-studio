import React, { useMemo } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import ClipPlane from "./ClipPlane";

const loader = new STLLoader();

export default function ShapeGeometry({
  stl,
  clipDirection = null,
  clipConstant = 0,
}: {
  stl: Uint8Array;
  clipDirection?: number[] | null;
  clipConstant?: number;
}) {
  const geometry = useMemo(() => {
    const buffer = stl.buffer.slice(
      stl.byteOffset,
      stl.byteOffset + stl.byteLength
    );
    const geo = loader.parse(buffer);
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, [stl]);

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 30);
  }, [geometry]);

  const clippingPlane = useMemo(() => {
    if (!clipDirection) return null;
    const plane = new THREE.Plane();
    plane.normal.set(
      clipDirection[0],
      clipDirection[1],
      clipDirection[2]
    );
    plane.constant = clipConstant;
    return plane;
  }, [clipDirection, clipConstant]);

  return (
    <ClipPlane sideColor="#fbbf24" clippingPlane={clippingPlane}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#8B9DC3"
          polygonOffset
          polygonOffsetFactor={2.0}
          polygonOffsetUnits={1.0}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#4a5568" />
      </lineSegments>
    </ClipPlane>
  );
}
