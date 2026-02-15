import { describe, it, expect } from "vitest";
import {
  createManifest,
  clampParameters,
  applyDefaults,
  serializeManifest,
} from "../src/openscad/manifest";
import type { ParameterDef } from "../src/openscad/types";

const sampleDefs: ParameterDef[] = [
  { name: "height", default: 12, min: 1, max: 100, description: "height of the stem" },
  { name: "radius", default: 5, min: 0.5, max: 50 },
  { name: "label", default: "part-a" },
];

describe("createManifest", () => {
  it("creates a valid manifest", () => {
    const manifest = createManifest("test-model", sampleDefs, "1.0.0");
    expect(manifest.model).toBe("test-model");
    expect(manifest.generatorVersion).toBe("1.0.0");
    expect(manifest.parameters).toHaveLength(3);
    expect(manifest.generatedAt).toBeDefined();
  });

  it("uses 'unknown' when no version provided", () => {
    const manifest = createManifest("test-model", []);
    expect(manifest.generatorVersion).toBe("unknown");
  });
});

describe("clampParameters", () => {
  it("clamps values to declared ranges", () => {
    const result = clampParameters(
      { height: 200, radius: -10, label: "test" },
      sampleDefs
    );
    expect(result.height).toBe(100); // clamped to max
    expect(result.radius).toBe(0.5); // clamped to min
    expect(result.label).toBe("test"); // unchanged (string)
  });

  it("leaves in-range values unchanged", () => {
    const result = clampParameters(
      { height: 50, radius: 10 },
      sampleDefs
    );
    expect(result.height).toBe(50);
    expect(result.radius).toBe(10);
  });

  it("handles missing min/max gracefully", () => {
    const defs: ParameterDef[] = [{ name: "x", default: 5 }];
    const result = clampParameters({ x: 999 }, defs);
    expect(result.x).toBe(999); // no range to clamp
  });
});

describe("applyDefaults", () => {
  it("fills missing params with defaults", () => {
    const result = applyDefaults({}, sampleDefs);
    expect(result.height).toBe(12);
    expect(result.radius).toBe(5);
    expect(result.label).toBe("part-a");
  });

  it("preserves user-provided values", () => {
    const result = applyDefaults({ height: 30 }, sampleDefs);
    expect(result.height).toBe(30);
    expect(result.radius).toBe(5);
  });
});

describe("serializeManifest", () => {
  it("produces valid JSON", () => {
    const manifest = createManifest("m", sampleDefs, "v1");
    const json = serializeManifest(manifest);
    const parsed = JSON.parse(json);
    expect(parsed.model).toBe("m");
    expect(parsed.parameters).toHaveLength(3);
  });
});
