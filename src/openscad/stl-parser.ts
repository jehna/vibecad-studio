/**
 * Binary STL parser.
 *
 * Parses binary STL files into flat Float32Array buffers that can be
 * passed directly to Three.js BufferGeometry as position/normal attributes.
 *
 * Binary STL format:
 *   80 bytes  - header (ignored)
 *   4 bytes   - uint32 triangle count
 *   per triangle (50 bytes):
 *     12 bytes - normal  (3 × float32)
 *     36 bytes - vertices (3 vertices × 3 × float32)
 *     2 bytes  - attribute byte count (ignored)
 */

import type { ParsedMesh } from "./types";

export function parseStlBinary(buffer: ArrayBuffer): ParsedMesh {
  const view = new DataView(buffer);

  if (buffer.byteLength < 84) {
    throw new Error("STL file too small to contain header + triangle count");
  }

  const triangleCount = view.getUint32(80, true);
  const expectedSize = 84 + triangleCount * 50;

  if (buffer.byteLength < expectedSize) {
    throw new Error(
      `STL file truncated: expected ${expectedSize} bytes for ${triangleCount} triangles, got ${buffer.byteLength}`
    );
  }

  // 3 vertices per triangle, 3 components per vertex
  const vertexCount = triangleCount * 3;
  const vertices = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);

  let offset = 84;

  for (let t = 0; t < triangleCount; t++) {
    // Read face normal
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    offset += 12;

    // For each of the 3 vertices
    for (let v = 0; v < 3; v++) {
      const idx = (t * 3 + v) * 3;

      vertices[idx] = view.getFloat32(offset, true);
      vertices[idx + 1] = view.getFloat32(offset + 4, true);
      vertices[idx + 2] = view.getFloat32(offset + 8, true);
      offset += 12;

      // Assign face normal to each vertex of the triangle
      normals[idx] = nx;
      normals[idx + 1] = ny;
      normals[idx + 2] = nz;
    }

    // Skip 2-byte attribute byte count
    offset += 2;
  }

  return { vertices, normals, triangleCount };
}

/**
 * Compute the axis-aligned bounding box of a parsed mesh.
 * Useful for sanity-checking generated geometry.
 */
export function computeBoundingBox(mesh: ParsedMesh): {
  min: [number, number, number];
  max: [number, number, number];
} {
  const { vertices } = mesh;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < vertices.length; i += 3) {
    min[0] = Math.min(min[0], vertices[i]);
    min[1] = Math.min(min[1], vertices[i + 1]);
    min[2] = Math.min(min[2], vertices[i + 2]);
    max[0] = Math.max(max[0], vertices[i]);
    max[1] = Math.max(max[1], vertices[i + 1]);
    max[2] = Math.max(max[2], vertices[i + 2]);
  }

  return { min, max };
}

/**
 * Validate basic properties of a parsed mesh.
 * Returns an array of issues found (empty if valid).
 */
export function validateMesh(mesh: ParsedMesh): string[] {
  const issues: string[] = [];

  if (mesh.triangleCount === 0) {
    issues.push("Mesh has zero triangles");
  }

  if (mesh.vertices.length !== mesh.triangleCount * 9) {
    issues.push(
      `Vertex count mismatch: expected ${mesh.triangleCount * 9}, got ${mesh.vertices.length}`
    );
  }

  // Check for NaN values in vertices
  let nanCount = 0;
  for (let i = 0; i < mesh.vertices.length; i++) {
    if (Number.isNaN(mesh.vertices[i])) nanCount++;
  }
  if (nanCount > 0) {
    issues.push(`Found ${nanCount} NaN values in vertex data`);
  }

  // Check for degenerate bounding box (all vertices at same point)
  if (mesh.triangleCount > 0) {
    const { min, max } = computeBoundingBox(mesh);
    const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    if (size[0] === 0 && size[1] === 0 && size[2] === 0) {
      issues.push("All vertices are at the same point (degenerate mesh)");
    }
  }

  return issues;
}
