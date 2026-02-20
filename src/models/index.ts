import { parseScad, slugToName } from "@/utils/scadParser";

const scadModules = import.meta.glob<string>("./*/model.scad", {
  query: "?raw",
  import: "default",
  eager: true,
});

const scadLibs = import.meta.glob<string>("./lib/*.scad", {
  query: "?raw",
  import: "default",
  eager: true,
});

function buildLibs(): Record<string, string> {
  const libs: Record<string, string> = {};
  for (const [path, source] of Object.entries(scadLibs)) {
    const filename = path.split("/").pop()!;
    libs[filename] = source;
  }
  return libs;
}

const libs = buildLibs();

export function getLibs(): Record<string, string> {
  return libs;
}

export interface ModelEntry {
  slug: string;
  name: string;
  description: string;
  source: string;
}

function buildModels(): ModelEntry[] {
  return Object.entries(scadModules).map(([path, source]) => {
    const slug = path.match(/\.\/([^/]+)\//)?.[1] ?? "unknown";
    const parsed = parseScad(source);
    return {
      slug,
      name: slugToName(slug),
      description: parsed.description,
      source,
    };
  });
}

const models = buildModels();

export function getModels(): { slug: string; name: string; description: string }[] {
  return models.map(({ slug, name, description }) => ({ slug, name, description }));
}

export function getModelSource(slug: string): string | undefined {
  return models.find((m) => m.slug === slug)?.source;
}
