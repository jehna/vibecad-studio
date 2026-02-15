/** Parameter definition for an OpenSCAD model */
export interface ParameterDef {
  name: string;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

/** Runtime parameter values passed to a model generator */
export type ModelParameters = Record<string, number | string | boolean>;

/** Result of compiling SCAD source to a mesh */
export type CompileResult =
  | { ok: true; stl: Uint8Array }
  | { ok: false; error: string; raw?: unknown };

/** Manifest describing a generated model */
export interface ModelManifest {
  model: string;
  generatorVersion: string;
  generatedAt: string;
  parameters: ParameterDef[];
}

/** A single structured diagnostic message */
export interface Diagnostic {
  severity: "error" | "warning" | "info";
  message: string;
  /** File and line in the SCAD source, if available */
  scadLocation?: { line: number; column?: number };
  /** Corresponding TypeScript source location, if mapped */
  tsLocation?: { file: string; line: number };
  /** Suggested remediation */
  suggestion?: string;
}

/** Container for all diagnostics from a compilation run */
export interface DiagnosticsReport {
  model: string;
  timestamp: string;
  diagnostics: Diagnostic[];
  scadSource?: string;
  success: boolean;
}

/** Output from the TypeScript → OpenSCAD bridge's generateScad function */
export interface GenerateScadResult {
  scad: string;
  manifest: ModelManifest;
  sourceMap?: ScadSourceMap;
}

/** Simple mapping from SCAD output lines to TS generator source lines */
export interface ScadSourceMap {
  /** Maps SCAD line number → { tsFile, tsLine } */
  entries: Array<{
    scadLine: number;
    tsFile: string;
    tsLine: number;
  }>;
}

/** Parsed mesh data from an STL file, compatible with Three.js BufferGeometry */
export interface ParsedMesh {
  vertices: Float32Array;
  normals: Float32Array;
  triangleCount: number;
}

/** OpenSCAD model definition extending the base model concept */
export interface OpenScadModelModule {
  defaultParams: ModelParameters;
  generateScad: (params: ModelParameters) => GenerateScadResult;
  parameterDefs?: ParameterDef[];
}
