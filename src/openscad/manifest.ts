import type { ModelManifest, ParameterDef, ModelParameters } from "./types";

/**
 * Build a ModelManifest from parameter definitions and model metadata.
 */
export function createManifest(
  modelName: string,
  parameters: ParameterDef[],
  generatorVersion?: string
): ModelManifest {
  return {
    model: modelName,
    generatorVersion: generatorVersion ?? "unknown",
    generatedAt: new Date().toISOString(),
    parameters,
  };
}

/**
 * Clamp numeric parameters to their declared min/max ranges.
 * Returns a new params object with clamped values.
 */
export function clampParameters(
  params: ModelParameters,
  defs: ParameterDef[]
): ModelParameters {
  const result = { ...params };

  for (const def of defs) {
    const val = result[def.name];
    if (typeof val === "number") {
      let clamped = val;
      if (def.min !== undefined) clamped = Math.max(def.min, clamped);
      if (def.max !== undefined) clamped = Math.min(def.max, clamped);
      result[def.name] = clamped;
    }
  }

  return result;
}

/**
 * Merge user-provided params with defaults from parameter definitions.
 */
export function applyDefaults(
  params: ModelParameters,
  defs: ParameterDef[]
): ModelParameters {
  const result: ModelParameters = {};
  for (const def of defs) {
    result[def.name] = def.name in params ? params[def.name] : def.default;
  }
  return result;
}

/**
 * Serialize manifest to JSON string for writing to disk.
 */
export function serializeManifest(manifest: ModelManifest): string {
  return JSON.stringify(manifest, null, 2);
}
