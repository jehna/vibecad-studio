import { describe, it, expect } from "vitest";
import { ScadBuilder } from "../src/openscad/scad-builder";

describe("ScadBuilder", () => {
  it("generates a cube primitive", () => {
    const s = new ScadBuilder();
    s.cube([10, 20, 30], true);
    expect(s.build()).toBe("cube(size=[10, 20, 30], center=true);\n");
  });

  it("generates a sphere with $fn", () => {
    const s = new ScadBuilder();
    s.sphere({ r: 5, fn: 64 });
    expect(s.build()).toBe("sphere(r=5, $fn=64);\n");
  });

  it("generates a cylinder", () => {
    const s = new ScadBuilder();
    s.cylinder({ h: 20, r: 3, fn: 32 });
    expect(s.build()).toBe("cylinder(h=20, r=3, $fn=32);\n");
  });

  it("generates translate + nested body", () => {
    const s = new ScadBuilder();
    s.translate([10, 0, 5], () => {
      s.cube(5);
    });
    const out = s.build();
    expect(out).toContain("translate([10, 0, 5]) {");
    expect(out).toContain("  cube(size=5, center=false);");
    expect(out).toContain("}");
  });

  it("generates boolean difference", () => {
    const s = new ScadBuilder();
    s.difference(() => {
      s.cube([10, 10, 10]);
      s.translate([2, 2, -1], () => {
        s.cylinder({ h: 12, r: 3, fn: 32 });
      });
    });
    const out = s.build();
    expect(out).toContain("difference() {");
    expect(out).toContain("  cube(size=[10, 10, 10], center=false);");
    expect(out).toContain("  translate([2, 2, -1]) {");
    expect(out).toContain("    cylinder(h=12, r=3, $fn=32);");
  });

  it("generates union", () => {
    const s = new ScadBuilder();
    s.union(() => {
      s.sphere({ r: 5 });
      s.cube(10);
    });
    expect(s.build()).toContain("union() {");
    expect(s.build()).toContain("  sphere(r=5);");
    expect(s.build()).toContain("  cube(size=10, center=false);");
  });

  it("generates module declaration and call", () => {
    const s = new ScadBuilder();
    s.moduleDecl("my_part", ["h=10", "r=5"], () => {
      s.cylinder({ h: 10, r: 5 });
    });
    s.moduleCall("my_part", { h: 20, r: 8 });
    const out = s.build();
    expect(out).toContain("module my_part(h=10, r=5) {");
    expect(out).toContain("my_part(h=20, r=8);");
  });

  it("generates linear extrude", () => {
    const s = new ScadBuilder();
    s.linearExtrude({ height: 10, twist: 45 }, () => {
      s.circle({ r: 5 });
    });
    const out = s.build();
    expect(out).toContain("linear_extrude(height=10, twist=45) {");
    expect(out).toContain("  circle(r=5);");
  });

  it("generates mirror transform", () => {
    const s = new ScadBuilder();
    s.mirror([1, 0, 0], () => {
      s.cube(5);
    });
    expect(s.build()).toContain("mirror([1, 0, 0]) {");
  });

  it("inserts raw SCAD", () => {
    const s = new ScadBuilder();
    s.raw("// custom comment");
    s.raw("custom_module();");
    const out = s.build();
    expect(out).toContain("// custom comment");
    expect(out).toContain("custom_module();");
  });

  it("inserts comments", () => {
    const s = new ScadBuilder();
    s.comment("This is a comment");
    expect(s.build()).toBe("// This is a comment\n");
  });

  it("handles nested indentation correctly", () => {
    const s = new ScadBuilder();
    s.difference(() => {
      s.union(() => {
        s.cube(10);
      });
    });
    const lines = s.build().split("\n").filter(Boolean);
    expect(lines[0]).toBe("difference() {");
    expect(lines[1]).toBe("  union() {");
    expect(lines[2]).toBe("    cube(size=10, center=false);");
    expect(lines[3]).toBe("  }");
    expect(lines[4]).toBe("}");
  });

  it("formats floating point numbers cleanly", () => {
    const s = new ScadBuilder();
    s.cylinder({ h: 10.5, r: 3.14159265 });
    expect(s.build()).toContain("h=10.5");
    expect(s.build()).toContain("r=3.141593");
  });

  it("reset() clears state", () => {
    const s = new ScadBuilder();
    s.cube(10);
    s.reset();
    s.sphere({ r: 3 });
    expect(s.build()).toBe("sphere(r=3);\n");
    expect(s.build()).not.toContain("cube");
  });

  it("tracks source map entries", () => {
    const s = new ScadBuilder("test.ts");
    s.raw("cylinder(h=10, r=5);", 42);
    const map = s.getSourceMap();
    expect(map).toHaveLength(1);
    expect(map[0].scadLine).toBe(1);
    expect(map[0].tsLine).toBe(42);
    expect(map[0].tsFile).toBe("test.ts");
  });
});
