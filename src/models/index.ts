import type { ModelDefinition } from "./types";

const modelModules = import.meta.glob<{ default: ModelDefinition }>(
  "./*/index.ts",
  { eager: true }
);

export function getModels(): ModelDefinition[] {
  return Object.values(modelModules).map((mod) => mod.default);
}

export function getModelBySlug(slug: string): ModelDefinition | undefined {
  return getModels().find((m) => m.slug === slug);
}
