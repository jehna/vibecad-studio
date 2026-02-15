import { describe, it, expect } from "vitest";
import {
  generateScad,
  defaultParams,
  parameterDefs,
} from "../src/models/openscad-bolt/model";

describe("OpenSCAD bolt model", () => {
  it("exports defaultParams matching parameterDefs", () => {
    for (const def of parameterDefs) {
      expect(defaultParams).toHaveProperty(def.name);
      expect(defaultParams[def.name]).toBe(def.default);
    }
  });

  it("generates valid SCAD from default params", () => {
    const result = generateScad(defaultParams);

    expect(result.scad).toBeDefined();
    expect(result.scad.length).toBeGreaterThan(0);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.model).toBe("openscad-bolt");
  });

  it("generated SCAD contains expected modules", () => {
    const result = generateScad(defaultParams);
    expect(result.scad).toContain("module hex_head");
    expect(result.scad).toContain("module shank");
    expect(result.scad).toContain("union()");
  });

  it("generated SCAD uses default parameter values", () => {
    const result = generateScad(defaultParams);
    // Check that default shankDiameter=6 appears in the SCAD
    expect(result.scad).toContain("d=6");
    // Check that default shankLength=20 appears
    expect(result.scad).toContain("l=20");
  });

  it("respects parameter clamping for headDiameter", () => {
    const result = generateScad({ ...defaultParams, headDiameter: 50 });
    // headDiameter is clamped to max 30
    expect(result.scad).toContain("d=30");
  });

  it("includes manifest with all parameter defs", () => {
    const result = generateScad(defaultParams);
    expect(result.manifest.parameters).toHaveLength(parameterDefs.length);
    for (const def of parameterDefs) {
      const found = result.manifest.parameters.find((p) => p.name === def.name);
      expect(found).toBeDefined();
      expect(found!.description).toBe(def.description);
    }
  });

  it("includes source map", () => {
    const result = generateScad(defaultParams);
    expect(result.sourceMap).toBeDefined();
    expect(result.sourceMap!.entries).toBeInstanceOf(Array);
  });

  it("generates different SCAD for different params", () => {
    const result1 = generateScad({ ...defaultParams, shankLength: 10 });
    const result2 = generateScad({ ...defaultParams, shankLength: 50 });
    expect(result1.scad).not.toBe(result2.scad);
  });
});
