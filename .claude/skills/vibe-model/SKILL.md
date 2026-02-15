---
name: vibe-model
description: Create or modify parametric 3D models for VibeCad Studio using OpenSCAD. Use when the user wants to create a new model, modify geometry or parameters, or understand how a model works.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(node scripts/verify-model.js *), Bash(mkdir -p src/models/*)
---

# VibeCad Model Author

Create or modify parametric 3D models for VibeCad Studio using OpenSCAD.

## Project Context

VibeCad Studio is a browser-based parametric CAD workbench. Models are written in **OpenSCAD** (.scad files) and compiled to STL via openscad-wasm. Models are auto-discovered — no manual registration needed.

## Model File Structure

Each model lives in `src/models/<slug>/` with a single file:

### `src/models/<slug>/model.scad`

```scad
// Description shown on the home page gallery
length = 40; // [10:100]
width = 30;  // [5:80]
height = 20; // [5:60]

cube([length, width, height]);
```

**Conventions:**
- **First line**: `// comment` becomes the model description for the gallery
- **Parameters**: `name = value; // [min:max]` or `name = value; // [min:step:max]` become UI sliders
- The folder name becomes the slug, which is auto-converted to a display name (`example-box` → `Example Box`)

## Key Conventions

- Parameter names should be `snake_case` and descriptive (e.g. `wall_thickness`, not `wt`)
- All parameter values are numbers
- Use `$fn` for controlling curve resolution (32 is a good default)
- Keep models manifold (watertight) for 3D printing compatibility

## OpenSCAD Quick Reference

### 3D Primitives

```scad
cube([x, y, z]);                    // box
cube([x, y, z], center=true);       // centered box
sphere(r=radius, $fn=64);           // sphere
cylinder(h=height, r=radius, $fn=32); // cylinder
cylinder(h=height, r1=bot, r2=top, $fn=32); // cone/frustum
```

### 2D Primitives (for extrusion)

```scad
square([w, h]);
square([w, h], center=true);
circle(r=radius, $fn=64);
polygon(points=[[x1,y1], [x2,y2], ...]);
text("hello", size=10);
```

### Transformations

```scad
translate([x, y, z]) { ... }
rotate([rx, ry, rz]) { ... }        // degrees
scale([sx, sy, sz]) { ... }
mirror([x, y, z]) { ... }
color("red") { ... }
color([r, g, b, a]) { ... }
```

### Boolean Operations

```scad
union() { a(); b(); }               // combine shapes
difference() { a(); b(); }          // subtract b from a
intersection() { a(); b(); }        // keep overlap only
```

### Extrusions

```scad
linear_extrude(height=h, twist=deg, scale=s) { 2d_shape(); }
rotate_extrude(angle=360, $fn=64) { 2d_profile(); }
```

### Hull & Minkowski

```scad
hull() { a(); b(); }                // convex hull
minkowski() { a(); b(); }           // Minkowski sum (rounding)
```

### Modules (reusable components)

```scad
module rounded_box(size, radius) {
    minkowski() {
        cube([size[0]-2*radius, size[1]-2*radius, size[2]/2]);
        cylinder(r=radius, h=size[2]/2, $fn=32);
    }
}

rounded_box([40, 30, 20], 3);
```

### Loops & Conditionals

```scad
for (i = [0:5]) { translate([i*10, 0, 0]) cube(5); }
for (a = [0:60:300]) { rotate([0, 0, a]) translate([20, 0, 0]) sphere(3); }
if (wall > 0) { difference() { outer(); inner(); } }
```

### Useful Patterns

```scad
// Hollow box (shell)
difference() {
    cube([outer_w, outer_d, outer_h]);
    translate([wall, wall, wall])
        cube([outer_w - 2*wall, outer_d - 2*wall, outer_h]);
}

// Rounded edges via minkowski
minkowski() {
    cube([w - 2*r, d - 2*r, h/2]);
    cylinder(r=r, h=h/2, $fn=32);
}

// Circular pattern
for (i = [0:n-1]) {
    rotate([0, 0, i * 360/n])
        translate([radius, 0, 0])
            child_shape();
}
```

## Workflow

When creating a **new** model:

1. Read 1-2 existing models for reference patterns
2. Create the folder: `mkdir -p src/models/<slug>/`
3. Write `src/models/<slug>/model.scad`
4. Run `node scripts/verify-model.js src/models/<slug>/model.scad` to verify
5. If errors, fix and re-run until exit code 0

When **modifying** an existing model:

1. Read the current model.scad
2. Make the requested changes
3. Run `node scripts/verify-model.js src/models/<slug>/model.scad` to verify

## Tips

- Start simple, iterate. A basic cube is better than a broken complex shape.
- OpenSCAD error messages include line numbers — use them to pinpoint issues.
- `minkowski()` is expensive — use it sparingly and with low-poly shapes.
- `$fn` controls facet count: higher = smoother but slower. 32 for cylinders, 64 for spheres.
- `difference()` subtracts all children after the first from the first child.
- Use `center=true` on primitives to simplify positioning.
- The dev server supports HMR — model changes appear live in the browser.

## Existing Models for Reference

| Model | Slug | Techniques |
|---|---|---|
| Example Box | `example-box` | minkowski rounding, difference for hollow interior, parametric dimensions |
