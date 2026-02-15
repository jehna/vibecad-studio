# Architecture — TypeScript → OpenSCAD → 3D Render Pipeline

VibeCad Studio supports two model backends:

1. **replicad** (default) — TypeScript → OpenCASCADE.js WASM → Three.js
2. **OpenSCAD** — TypeScript → SCAD source → OpenSCAD WASM → STL → Three.js

## Pipeline Diagram

```
┌───────────────────────────────────┐
│   Model author (TypeScript)       │
│   src/models/<slug>/model.ts      │
└───────────┬───────────────────────┘
            │
      ┌─────▼─────┐
      │ model.ts   │
      │ exports:   │
      │  main()    │──────► replicad pipeline (existing)
      │  -or-      │
      │  generateScad() ──► OpenSCAD pipeline (new)
      └─────┬──────┘
            │
  ┌─────────▼──────────┐
  │  builder.worker.ts  │ (Web Worker via Comlink)
  │  detects model type │
  └────┬──────────┬────┘
       │          │
  replicad     OpenSCAD
       │          │
       ▼          ▼
  OpenCASCADE   ScadBuilder → SCAD string
  .js WASM         │
       │      compileScadToStl()
       │      (OpenSCAD WASM)
       │           │
       │      parseStlBinary()
       │           │
       ▼           ▼
  { mesh, edges } / { format:"stl", vertices, normals }
       │           │
       └─────┬─────┘
             ▼
  ┌──────────────────┐
  │   MobX store      │
  │   currentMesh[]    │
  └────────┬──────────┘
           ▼
  ┌──────────────────┐
  │  EditorViewer     │
  │  ShapeGeometry    │
  │   ├─ ReplicadFacesMesh (replicad format)
  │   └─ StlFacesMesh      (STL format)
  └──────────────────┘
           ▼
     Three.js canvas
```

## Key Files

| File | Purpose |
|------|---------|
| `src/openscad/types.ts` | TypeScript interfaces for the pipeline |
| `src/openscad/scad-builder.ts` | DSL for composing OpenSCAD source |
| `src/openscad/wasm-compiler.ts` | OpenSCAD WASM wrapper |
| `src/openscad/stl-parser.ts` | Binary STL → mesh data |
| `src/openscad/manifest.ts` | Parameter metadata & manifest |
| `src/openscad/diagnostics.ts` | Error parsing & formatting |
| `src/builder.worker.ts` | Worker dispatches to replicad or OpenSCAD |
| `src/components-3d/StlMesh.tsx` | Three.js renderer for STL meshes |
| `src/components-3d/ShapeGeometry.tsx` | Handles both replicad and STL shapes |
| `src/components/OpenScadDiagnostics.tsx` | UI component for error display |

## Model Type Detection

The worker detects the model backend by checking the module's exports:

- If `model.ts` exports `generateScad()` → OpenSCAD pipeline
- Otherwise → replicad pipeline (calls `main()`)

## Error Flow

```
OpenSCAD WASM error
  → createDiagnosticsReport() — structured diagnostics
  → formatDiagnosticsForConsole() — console.error()
  → formatDiagnosticsForUI() — { summary, details }
  → returned as { error: true, message, diagnostics, scadSource }
  → MobX store.error
  → VisualizerPane / Autoload — OpenScadDiagnostics component
```
