import { describe, it, expect } from "vitest";
import {
  parseStlBinary,
  computeBoundingBox,
  validateMesh,
} from "../src/openscad/stl-parser";

/**
 * Build a minimal binary STL with the given triangles.
 * Each triangle is { normal: [x,y,z], vertices: [[x,y,z],[x,y,z],[x,y,z]] }
 */
function buildStlBinary(
  triangles: Array<{
    normal: [number, number, number];
    vertices: [[number, number, number], [number, number, number], [number, number, number]];
  }>
): ArrayBuffer {
  const size = 84 + triangles.length * 50;
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);

  // 80-byte header (zeros)
  // Triangle count at offset 80
  view.setUint32(80, triangles.length, true);

  let offset = 84;
  for (const tri of triangles) {
    // Normal
    view.setFloat32(offset, tri.normal[0], true);
    view.setFloat32(offset + 4, tri.normal[1], true);
    view.setFloat32(offset + 8, tri.normal[2], true);
    offset += 12;

    // 3 vertices
    for (const v of tri.vertices) {
      view.setFloat32(offset, v[0], true);
      view.setFloat32(offset + 4, v[1], true);
      view.setFloat32(offset + 8, v[2], true);
      offset += 12;
    }

    // Attribute byte count
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

describe("parseStlBinary", () => {
  it("parses a single-triangle STL", () => {
    const stl = buildStlBinary([
      {
        normal: [0, 0, 1],
        vertices: [
          [0, 0, 0],
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
    ]);

    const mesh = parseStlBinary(stl);
    expect(mesh.triangleCount).toBe(1);
    expect(mesh.vertices.length).toBe(9); // 3 verts × 3 components
    expect(mesh.normals.length).toBe(9);

    // Check vertex data
    expect(mesh.vertices[0]).toBe(0); // v0.x
    expect(mesh.vertices[3]).toBe(1); // v1.x
    expect(mesh.vertices[7]).toBe(1); // v2.y

    // Check normals (all should be [0,0,1])
    for (let i = 0; i < 3; i++) {
      expect(mesh.normals[i * 3]).toBe(0);
      expect(mesh.normals[i * 3 + 1]).toBe(0);
      expect(mesh.normals[i * 3 + 2]).toBe(1);
    }
  });

  it("parses multi-triangle STL", () => {
    const stl = buildStlBinary([
      {
        normal: [0, 0, 1],
        vertices: [
          [0, 0, 0],
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
      {
        normal: [0, 0, -1],
        vertices: [
          [0, 0, -1],
          [1, 0, -1],
          [0, 1, -1],
        ],
      },
    ]);

    const mesh = parseStlBinary(stl);
    expect(mesh.triangleCount).toBe(2);
    expect(mesh.vertices.length).toBe(18);
    expect(mesh.normals.length).toBe(18);
  });

  it("throws on too-small buffer", () => {
    const buffer = new ArrayBuffer(50);
    expect(() => parseStlBinary(buffer)).toThrow("too small");
  });

  it("throws on truncated buffer", () => {
    const stl = buildStlBinary([
      {
        normal: [0, 0, 1],
        vertices: [
          [0, 0, 0],
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
    ]);

    // Truncate the buffer
    const truncated = stl.slice(0, 100);
    expect(() => parseStlBinary(truncated)).toThrow("truncated");
  });
});

describe("computeBoundingBox", () => {
  it("computes bounding box for a simple triangle", () => {
    const stl = buildStlBinary([
      {
        normal: [0, 0, 1],
        vertices: [
          [0, 0, 0],
          [10, 0, 0],
          [0, 5, 3],
        ],
      },
    ]);

    const mesh = parseStlBinary(stl);
    const bbox = computeBoundingBox(mesh);

    expect(bbox.min).toEqual([0, 0, 0]);
    expect(bbox.max).toEqual([10, 5, 3]);
  });

  it("handles negative coordinates", () => {
    const stl = buildStlBinary([
      {
        normal: [0, 0, 1],
        vertices: [
          [-5, -3, -1],
          [5, 3, 1],
          [0, 0, 0],
        ],
      },
    ]);

    const mesh = parseStlBinary(stl);
    const bbox = computeBoundingBox(mesh);

    expect(bbox.min).toEqual([-5, -3, -1]);
    expect(bbox.max).toEqual([5, 3, 1]);
  });
});

describe("validateMesh", () => {
  it("returns no issues for a valid mesh", () => {
    const stl = buildStlBinary([
      {
        normal: [0, 0, 1],
        vertices: [
          [0, 0, 0],
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
    ]);

    const mesh = parseStlBinary(stl);
    const issues = validateMesh(mesh);
    expect(issues).toEqual([]);
  });

  it("flags zero-triangle mesh", () => {
    const mesh = {
      vertices: new Float32Array(0),
      normals: new Float32Array(0),
      triangleCount: 0,
    };
    const issues = validateMesh(mesh);
    expect(issues).toContain("Mesh has zero triangles");
  });
});
