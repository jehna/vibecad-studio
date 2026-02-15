// Public API for the OpenSCAD pipeline
export { ScadBuilder } from "./scad-builder";
export {
  compileScadToStl,
  configureWasmLoader,
  isWasmAvailable,
  preloadWasm,
} from "./wasm-compiler";
export type { WasmLoaderOptions } from "./wasm-compiler";
export { parseStlBinary, computeBoundingBox, validateMesh } from "./stl-parser";
export {
  createManifest,
  clampParameters,
  applyDefaults,
  serializeManifest,
} from "./manifest";
export {
  parseOpenScadOutput,
  mapDiagnosticsToSource,
  addSuggestions,
  createDiagnosticsReport,
  formatDiagnosticsForConsole,
  formatDiagnosticsForUI,
} from "./diagnostics";
export type {
  ParameterDef,
  ModelParameters,
  CompileResult,
  ModelManifest,
  Diagnostic,
  DiagnosticsReport,
  GenerateScadResult,
  ScadSourceMap,
  ParsedMesh,
  OpenScadModelModule,
} from "./types";
