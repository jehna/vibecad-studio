import React, { useRef, useEffect } from "react";
import { BufferGeometry, BufferAttribute } from "three";
import { useThree } from "@react-three/fiber";

/**
 * Renders a pre-parsed STL mesh (vertices + normals as Float32Array).
 * Used by the OpenSCAD pipeline where meshes come from compiled STL files
 * rather than replicad's internal mesh format.
 */
export function StlFacesMesh({
  vertices,
  normals,
  children,
  ...props
}: {
  vertices: Float32Array;
  normals: Float32Array;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  const { invalidate } = useThree();
  const geometry = useRef(new BufferGeometry());

  useEffect(() => {
    if (!vertices || !normals) return;

    const geo = geometry.current;
    geo.setAttribute("position", new BufferAttribute(vertices, 3));
    geo.setAttribute("normal", new BufferAttribute(normals, 3));
    geo.computeBoundingSphere();
    invalidate();
  }, [vertices, normals, invalidate]);

  useEffect(
    () => () => {
      geometry.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <mesh {...props}>
      <primitive object={geometry.current} attach="geometry" />
      {children}
    </mesh>
  );
}

/**
 * Renders wireframe edges for an STL mesh.
 * Extracts edges from triangle data to show wireframe outline.
 */
export function StlEdgesMesh({
  vertices,
  children,
  ...props
}: {
  vertices: Float32Array;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  const { invalidate } = useThree();
  const geometry = useRef(new BufferGeometry());

  useEffect(() => {
    if (!vertices) return;

    // Build edge segments from triangles: each triangle contributes 3 edges
    const triangleCount = vertices.length / 9;
    const edgeVertices = new Float32Array(triangleCount * 6 * 3); // 3 edges × 2 verts × 3 components

    for (let t = 0; t < triangleCount; t++) {
      const base = t * 9;
      const out = t * 18;

      // Edge 0: v0 → v1
      edgeVertices[out] = vertices[base];
      edgeVertices[out + 1] = vertices[base + 1];
      edgeVertices[out + 2] = vertices[base + 2];
      edgeVertices[out + 3] = vertices[base + 3];
      edgeVertices[out + 4] = vertices[base + 4];
      edgeVertices[out + 5] = vertices[base + 5];

      // Edge 1: v1 → v2
      edgeVertices[out + 6] = vertices[base + 3];
      edgeVertices[out + 7] = vertices[base + 4];
      edgeVertices[out + 8] = vertices[base + 5];
      edgeVertices[out + 9] = vertices[base + 6];
      edgeVertices[out + 10] = vertices[base + 7];
      edgeVertices[out + 11] = vertices[base + 8];

      // Edge 2: v2 → v0
      edgeVertices[out + 12] = vertices[base + 6];
      edgeVertices[out + 13] = vertices[base + 7];
      edgeVertices[out + 14] = vertices[base + 8];
      edgeVertices[out + 15] = vertices[base];
      edgeVertices[out + 16] = vertices[base + 1];
      edgeVertices[out + 17] = vertices[base + 2];
    }

    const geo = geometry.current;
    geo.setAttribute("position", new BufferAttribute(edgeVertices, 3));
    geo.computeBoundingSphere();
    invalidate();
  }, [vertices, invalidate]);

  useEffect(
    () => () => {
      geometry.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <lineSegments {...props}>
      <primitive object={geometry.current} attach="geometry" />
      {children}
    </lineSegments>
  );
}
