export interface ModelDefinition {
  name: string;
  description: string;
  slug: string;
  /**
   * Model backend: "replicad" (default) uses OpenCASCADE.js,
   * "openscad" generates SCAD source compiled via OpenSCAD WASM.
   */
  type?: "replicad" | "openscad";
}
