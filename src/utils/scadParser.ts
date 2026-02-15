export interface ScadParam {
  name: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface ScadParseResult {
  description: string;
  params: ScadParam[];
}

/**
 * Parse a .scad file to extract description and customizer parameters.
 * Description: first line if it's a // comment.
 * Parameters: lines matching `name = value; // [min:max]` or `name = value; // [min:step:max]`
 */
export function parseScad(source: string): ScadParseResult {
  const lines = source.split("\n");
  let description = "";
  const params: ScadParam[] = [];

  // First non-empty line as description if it's a comment
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (trimmed.startsWith("//")) {
      description = trimmed.replace(/^\/\/\s*/, "");
    }
    break;
  }

  // Match parameter lines: name = value; // [min:max] or [min:step:max]
  const paramRegex =
    /^(\w+)\s*=\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*;\s*\/\/\s*\[([^\]]+)\]/;

  for (const line of lines) {
    const match = line.match(paramRegex);
    if (!match) continue;

    const [, name, valueStr, rangeStr] = match;
    const value = parseFloat(valueStr);
    const parts = rangeStr.split(":").map((s) => parseFloat(s.trim()));

    const param: ScadParam = { name, value };

    if (parts.length === 2) {
      param.min = parts[0];
      param.max = parts[1];
    } else if (parts.length === 3) {
      param.min = parts[0];
      param.step = parts[1];
      param.max = parts[2];
    }

    params.push(param);
  }

  return { description, params };
}

/** Convert a slug like "example-box" to a display name like "Example Box" */
export function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
