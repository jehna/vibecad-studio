---
name: vibe-model
description: Create or modify parametric 3D models for VibeCad Studio using the replicad CAD library. Use when the user wants to create a new model, modify geometry or parameters, or understand how a model works.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npx tsc --noEmit), Bash(mkdir -p src/models/*)
---

# VibeCad Model Author

Create or modify parametric 3D models for VibeCad Studio using the replicad CAD library.

## Project Context

VibeCad Studio is a browser-based parametric CAD workbench. Models are written in TypeScript using the **replicad** library (v0.20.5), which wraps OpenCASCADE via WebAssembly. Models are auto-discovered — no manual registration needed.

## Model File Structure

Each model lives in `src/models/<slug>/` with exactly two files:

### 1. `src/models/<slug>/index.ts` — Metadata

```typescript
import type { ModelDefinition } from "../types";

const model: ModelDefinition = {
  name: "Human Readable Name",
  description: "Brief description for the gallery",
  slug: "kebab-case-slug", // Must match the folder name
};

export default model;
```

### 2. `src/models/<slug>/model.ts` — CAD Implementation

```typescript
import { draw } from "replicad";

export const defaultParams = {
  width: 50,
  height: 30,
};

export function main(params: typeof defaultParams) {
  const { width, height } = params;

  // Build and return replicad shape(s)
  return draw()
    .hLine(width)
    .vLine(height)
    .hLine(-width)
    .close()
    .sketchOnPlane("XY")
    .extrude(10);
}
```

**Required exports from model.ts:**
- `defaultParams` — object with numeric parameter values (these become UI sliders)
- `main(params)` — function returning a shape, array of shapes, or array of `{ shape, name?, color?, opacity? }`

## Key Conventions

- The `slug` in index.ts **must** match the folder name
- Parameter names should be camelCase and descriptive (e.g. `wallThickness`, not `wt`)
- All parameter values are numbers
- Type the main function param as `typeof defaultParams`
- Destructure params at the top of `main()`
- Helper functions can be defined in model.ts above `main()`
- Use `type` keyword for replicad type imports: `import { draw, type Solid } from "replicad"`
- Some replicad types are incomplete — use type assertions (`as Solid`, `as unknown as { wire: Wire }`) when needed

## Return Values

`main()` can return:
- A single shape (most common)
- An array of shapes (rendered as separate objects)
- An array of `{ shape, name?, color?, opacity?, labels? }` for named/colored multi-part models

## replicad API Quick Reference

### Drawing 2D Profiles (most common starting point)

```typescript
import { draw, drawCircle, drawRoundedRectangle, drawPolysides } from "replicad";

// Pen-style 2D drawing (returns Drawing)
draw()                          // start at origin
draw([x, y])                    // start at point
  .hLine(length)                // horizontal line
  .vLine(length)                // vertical line
  .line(dx, dy)                 // relative line
  .lineTo([x, y])              // absolute line
  .hBulgeArc(length, bulge)    // horizontal bulge arc
  .vBulgeArc(length, bulge)    // vertical bulge arc
  .smoothSplineTo([x, y], { endTangent?, startTangent?, startFactor?, endFactor? })
  .close()                      // close and return Drawing
  .done()                       // leave open, return Drawing
  .translate([dx, dy])          // translate 2D

// Shorthand shapes
drawCircle(radius)
drawRoundedRectangle(width, height, radius?)
drawPolysides(radius, sidesCount, sagitta?)
```

### From 2D to 3D

```typescript
// Drawing → Sketch (positioned in 3D)
drawing.sketchOnPlane(plane, origin?)
// plane: "XY" | "YZ" | "XZ" | "XZ" | number | [x,y,z]
// origin: number (offset) or [x,y,z]

// Sketch → 3D Shape
sketch.extrude(height)
sketch.revolve(angle?)           // revolve around axis
sketch.loftWith(otherSketches)

// Direct sketch helpers
import { sketchCircle, sketchRectangle, sketchRoundedRectangle } from "replicad";
sketchCircle(radius, { plane?, origin? })
sketchRectangle(width, height, { plane?, origin? })
```

### 3D Primitives

```typescript
import { makeBox, makeCylinder, makeSphere, makeEllipsoid } from "replicad";

makeBox([x1,y1,z1], [x2,y2,z2])
makeCylinder(radius, height, location?, direction?)
makeSphere(radius)
makeEllipsoid(a, b, c)
```

### Boolean Operations (on 3D shapes)

```typescript
shape.fuse(other)       // union
shape.cut(tool)         // subtraction
shape.intersect(tool)   // intersection
```

### Shape Modifications

```typescript
shape.fillet(radius)                              // fillet all edges
shape.fillet(radius, (e) => e.inPlane("XY", z))  // fillet filtered edges
shape.chamfer(radius)                             // chamfer edges
shape.shell(thickness, (f) => f.containsPoint([x,y,z]))  // hollow out
shape.translate([dx, dy, dz])
shape.rotate(angleDeg, center?, axis?)
shape.mirror(plane)                               // e.g. "YZ", "XY"
shape.clone()
```

### Edge Finders (for fillet/chamfer filtering)

```typescript
(e) => e.inPlane("XY", height)        // edges in a plane
(e) => e.inDirection("Z")             // edges along direction
(e) => e.withinDistance(dist, point)   // edges near a point
(e) => e.containsPoint([x,y,z])       // edges through a point
// Chain multiple: e.inPlane("XY").inDirection("X")
```

### Face Finders (for shell filtering)

```typescript
(f) => f.containsPoint([x,y,z])
(f) => f.inPlane("XY", height)
(f) => f.inDirection("Z")
```

### Advanced Operations

```typescript
import { loft, genericSweep, assembleWire } from "replicad";

// Loft between wire profiles
loft([wire1, wire2, wire3], { ruled?: boolean })

// Sweep a profile along a spine
genericSweep(sectionWire, spineWire, { frenet: true }, false)

// Combine edges/wires into one wire
assembleWire([edge1, edge2, wire1])
```

## Workflow

When creating a **new** model:

1. Read `src/models/types.ts` to confirm the ModelDefinition interface
2. Read 1-2 existing models for reference patterns (especially one with similar geometry)
3. Create the folder: `src/models/<slug>/`
4. Write `src/models/<slug>/index.ts` with metadata
5. Write `src/models/<slug>/model.ts` with defaultParams and main()
6. Run `npx tsc --noEmit` to type-check

When **modifying** an existing model:

1. Read the current model.ts and index.ts
2. Make the requested changes
3. Run `npx tsc --noEmit` to type-check

## Tips

- Start simple, iterate. A basic extruded rectangle is better than a broken complex shape.
- For organic shapes, use `smoothSplineTo` with tangent control.
- For mechanical parts, boolean operations (fuse/cut) with primitives work well.
- `shell()` is great for hollow objects (vases, containers, enclosures).
- `fillet()` rounds edges — apply after boolean operations, not before.
- When lofting, all wires must have the same number of edges.
- Use `.clone()` before `.fuse()` if you need the original shape later.
- The dev server supports HMR — model changes appear live in the browser.

## Existing Models for Reference

| Model | Slug | Techniques |
|---|---|---|
| Example Vase | `example-vase` | draw + smoothSpline, revolve, shell, fillet |
| Plant Light Holder | `plant-light-holder` | loft between U-profiles, boolean fuse/cut/intersect |
| Ski Holder | `ski-holder` | genericSweep with Frenet frame, mirror, fillet with edge finders |
