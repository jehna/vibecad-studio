# Parameter Schema

OpenSCAD models in VibeCad Studio use a structured parameter system that enables
the UI to surface controls (sliders, inputs) and ensures values are validated and clamped.

## Declaring Parameters

Each OpenSCAD model declares its parameters as an array of `ParameterDef` objects:

```typescript
import type { ParameterDef } from "../../openscad/types";

export const parameterDefs: ParameterDef[] = [
  {
    name: "height",
    default: 20,
    min: 5,
    max: 100,
    step: 1,
    description: "Height of the part in mm",
  },
  {
    name: "diameter",
    default: 10,
    min: 2,
    max: 50,
    description: "Outer diameter in mm",
  },
];
```

### ParameterDef Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | yes | Unique parameter identifier |
| `default` | `number \| string \| boolean` | yes | Default value |
| `min` | `number` | no | Minimum value (numeric params) |
| `max` | `number` | no | Maximum value (numeric params) |
| `step` | `number` | no | Step increment for UI sliders |
| `description` | `string` | no | Human-readable label for UI |

## Parameter Handling in Generators

Use the manifest utilities to apply defaults and clamping:

```typescript
import { clampParameters, applyDefaults } from "../../openscad/manifest";

export function generateScad(params: ModelParameters): GenerateScadResult {
  // Fill in missing params with defaults
  const withDefaults = applyDefaults(params, parameterDefs);

  // Clamp numeric values to declared min/max ranges
  const resolved = clampParameters(withDefaults, parameterDefs);

  const height = Number(resolved.height);
  // ... use clamped values in SCAD generation
}
```

## JSDoc Annotations (Optional)

For documentation purposes, parameters can also be annotated with JSDoc comments:

```typescript
/** @param height default=20 min=5 max=100 description="Height of the part in mm" */
```

These annotations serve as inline documentation; the `parameterDefs` array is the
authoritative source used by the runtime.

## Manifest

The `createManifest()` function generates a JSON-serializable manifest that includes
all parameter definitions along with model metadata:

```json
{
  "model": "my-model",
  "generatorVersion": "unknown",
  "generatedAt": "2026-02-15T09:00:00.000Z",
  "parameters": [
    {
      "name": "height",
      "default": 20,
      "min": 5,
      "max": 100,
      "description": "Height of the part in mm"
    }
  ]
}
```

## Deterministic Output

Models must produce deterministic output for the same parameter values.
Avoid uncontrolled `Math.random()` — expose a `seed` parameter instead:

```typescript
{ name: "seed", default: 42, min: 0, max: 99999, description: "Random seed" }
```
