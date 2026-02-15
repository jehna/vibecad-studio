# OpenSCAD Integration

## Overview

VibeCad Studio supports OpenSCAD as an alternative model backend alongside replicad.
OpenSCAD models are authored in TypeScript using the `ScadBuilder` DSL to generate
`.scad` source, which is compiled to STL via OpenSCAD WASM and rendered in Three.js.

## Setting Up OpenSCAD WASM

The OpenSCAD WASM module must be configured before models can be compiled.
Call `configureWasmLoader()` with a factory function that returns an initialized instance:

```typescript
import { configureWasmLoader } from "@/openscad";

configureWasmLoader({
  factory: async () => {
    // Load your OpenSCAD WASM build
    const instance = await initOpenSCAD();
    return instance;
  },
});
```

Alternatively, set `self.__openscad_wasm_factory` as a global before first compile.

### WASM vs CLI

| Mode | Use case | Setup |
|------|----------|-------|
| WASM | Browser dev loop | Configure via `configureWasmLoader()` |
| CLI  | CI / batch builds | `openscad -o output.stl input.scad` |

For CI environments without WASM support, use the OpenSCAD CLI directly.

## Creating an OpenSCAD Model

1. Create `src/models/<slug>/index.ts`:

```typescript
import type { ModelDefinition } from "../types";

const model: ModelDefinition = {
  name: "My Model",
  description: "Description",
  slug: "my-model",
  type: "openscad",
};

export default model;
```

2. Create `src/models/<slug>/model.ts`:

```typescript
import { ScadBuilder } from "../../openscad/scad-builder";
import { createManifest, clampParameters, applyDefaults } from "../../openscad/manifest";
import type { ModelParameters, ParameterDef, GenerateScadResult } from "../../openscad/types";

export const parameterDefs: ParameterDef[] = [
  { name: "height", default: 20, min: 5, max: 100, description: "Height (mm)" },
];

export const defaultParams: ModelParameters = Object.fromEntries(
  parameterDefs.map((p) => [p.name, p.default])
);

export function generateScad(params: ModelParameters): GenerateScadResult {
  const resolved = clampParameters(applyDefaults(params, parameterDefs), parameterDefs);
  const height = Number(resolved.height);

  const s = new ScadBuilder("my-model/model.ts");
  s.cylinder({ h: height, r: 5, fn: 64 });

  return {
    scad: s.build(),
    manifest: createManifest("my-model", parameterDefs),
    sourceMap: { entries: s.getSourceMap() },
  };
}
```

## ScadBuilder API

The `ScadBuilder` class provides a TypeScript DSL for composing OpenSCAD source:

### 3D Primitives
- `cube(size, center)` — Box
- `sphere({ r, d, fn })` — Sphere
- `cylinder({ h, r, r1, r2, d, fn, center })` — Cylinder/cone
- `polyhedron(points, faces)` — Arbitrary polyhedron

### 2D Primitives
- `circle({ r, d, fn })`
- `square(size, center)`
- `polygon(points)`

### Extrusions
- `linearExtrude(opts, body)` — Linear extrusion
- `rotateExtrude(opts, body)` — Rotational extrusion

### Boolean Operations
- `union(body)` — Union
- `difference(body)` — Difference
- `intersection(body)` — Intersection
- `hull(body)` — Convex hull
- `minkowski(body)` — Minkowski sum

### Transforms
- `translate(v, body)` — Translation
- `rotate(v, body)` — Rotation
- `scale(v, body)` — Scaling
- `mirror(v, body)` — Mirror
- `color(c, body)` — Color

### Modules
- `moduleDecl(name, params, body)` — Declare module
- `moduleCall(name, args)` — Call module

### Raw & Comments
- `raw(scad, tsLine?)` — Insert raw SCAD
- `comment(text)` — Insert comment

## Timeouts

The WASM compiler enforces a 30-second timeout by default.
Models with high `$fn` or complex Minkowski operations may need optimization.

## Error Diagnostics

When compilation fails, the diagnostics system:
1. Parses OpenSCAD error/warning output
2. Maps SCAD line numbers back to TypeScript source (via source map)
3. Adds remediation suggestions for common error patterns
4. Logs structured output to the console
5. Displays errors in the UI with the `OpenScadDiagnostics` component

## Running Tests

```bash
npm test              # run once
npm run test:watch    # watch mode
```

Tests cover the ScadBuilder DSL, STL parser, diagnostics, manifest generation,
and the sample bolt model.
