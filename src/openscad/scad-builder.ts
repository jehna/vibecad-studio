/**
 * TypeScript DSL for composing OpenSCAD source code.
 *
 * Usage:
 *   const s = new ScadBuilder();
 *   s.cylinder({ h: 10, r: 5, fn: 64 });
 *   s.translate([0, 0, 10], () => {
 *     s.sphere({ r: 6 });
 *   });
 *   console.log(s.build());
 */

type Vec3 = [number, number, number];

export interface ScadSourceEntry {
  scadLine: number;
  tsLine: number;
  tsFile: string;
}

export class ScadBuilder {
  private lines: string[] = [];
  private indentLevel = 0;
  private sourceMapEntries: ScadSourceEntry[] = [];
  private callerFile: string;

  constructor(callerFile = "<generator>") {
    this.callerFile = callerFile;
  }

  // ── helpers ──────────────────────────────────────────────

  private indent(): string {
    return "  ".repeat(this.indentLevel);
  }

  private emit(line: string, tsLine?: number): void {
    this.lines.push(`${this.indent()}${line}`);
    if (tsLine !== undefined) {
      this.sourceMapEntries.push({
        scadLine: this.lines.length,
        tsLine,
        tsFile: this.callerFile,
      });
    }
  }

  private block(header: string, body: () => void): void {
    this.emit(`${header} {`);
    this.indentLevel++;
    body();
    this.indentLevel--;
    this.emit("}");
  }

  private formatArgs(args: Record<string, unknown>): string {
    return Object.entries(args)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        if (k === "fn") return `$fn=${formatValue(v)}`;
        if (k === "fs") return `$fs=${formatValue(v)}`;
        if (k === "fa") return `$fa=${formatValue(v)}`;
        return `${k}=${formatValue(v)}`;
      })
      .join(", ");
  }

  // ── 3-D primitives ──────────────────────────────────────

  cube(size: Vec3 | number, center = false): void {
    const sizeStr = Array.isArray(size) ? formatValue(size) : String(size);
    this.emit(`cube(size=${sizeStr}, center=${center});`);
  }

  sphere(opts: { r?: number; d?: number; fn?: number }): void {
    this.emit(`sphere(${this.formatArgs(opts)});`);
  }

  cylinder(opts: {
    h: number;
    r?: number;
    r1?: number;
    r2?: number;
    d?: number;
    d1?: number;
    d2?: number;
    fn?: number;
    center?: boolean;
  }): void {
    this.emit(`cylinder(${this.formatArgs(opts)});`);
  }

  polyhedron(points: Vec3[], faces: number[][]): void {
    this.emit(
      `polyhedron(points=${formatValue(points)}, faces=${formatValue(faces)});`
    );
  }

  // ── 2-D primitives ──────────────────────────────────────

  circle(opts: { r?: number; d?: number; fn?: number }): void {
    this.emit(`circle(${this.formatArgs(opts)});`);
  }

  square(size: [number, number] | number, center = false): void {
    const sizeStr = Array.isArray(size) ? formatValue(size) : String(size);
    this.emit(`square(size=${sizeStr}, center=${center});`);
  }

  polygon(points: [number, number][]): void {
    this.emit(`polygon(points=${formatValue(points)});`);
  }

  // ── extrusions ──────────────────────────────────────────

  linearExtrude(
    opts: {
      height: number;
      center?: boolean;
      twist?: number;
      slices?: number;
      fn?: number;
    },
    body: () => void
  ): void {
    this.block(`linear_extrude(${this.formatArgs(opts)})`, body);
  }

  rotateExtrude(
    opts: { angle?: number; fn?: number },
    body: () => void
  ): void {
    this.block(`rotate_extrude(${this.formatArgs(opts)})`, body);
  }

  // ── boolean ops ─────────────────────────────────────────

  union(body: () => void): void {
    this.block("union()", body);
  }

  difference(body: () => void): void {
    this.block("difference()", body);
  }

  intersection(body: () => void): void {
    this.block("intersection()", body);
  }

  hull(body: () => void): void {
    this.block("hull()", body);
  }

  minkowski(body: () => void): void {
    this.block("minkowski()", body);
  }

  // ── transforms ──────────────────────────────────────────

  translate(v: Vec3, body: () => void): void {
    this.block(`translate(${formatValue(v)})`, body);
  }

  rotate(v: Vec3 | number, body: () => void): void {
    const arg = Array.isArray(v) ? formatValue(v) : String(v);
    this.block(`rotate(${arg})`, body);
  }

  scale(v: Vec3 | number, body: () => void): void {
    const arg = Array.isArray(v) ? formatValue(v) : String(v);
    this.block(`scale(${arg})`, body);
  }

  mirror(v: Vec3, body: () => void): void {
    this.block(`mirror(${formatValue(v)})`, body);
  }

  color(c: string | Vec3, body: () => void): void {
    const arg = typeof c === "string" ? `"${c}"` : formatValue(c);
    this.block(`color(${arg})`, body);
  }

  // ── modules ─────────────────────────────────────────────

  moduleDecl(
    name: string,
    params: string[],
    body: () => void
  ): void {
    this.block(`module ${name}(${params.join(", ")})`, body);
  }

  moduleCall(name: string, args?: Record<string, unknown>): void {
    if (args) {
      this.emit(`${name}(${this.formatArgs(args)});`);
    } else {
      this.emit(`${name}();`);
    }
  }

  // ── raw SCAD insertion ──────────────────────────────────

  raw(scad: string, tsLine?: number): void {
    for (const line of scad.split("\n")) {
      this.emit(line, tsLine);
    }
  }

  comment(text: string): void {
    this.emit(`// ${text}`);
  }

  // ── output ──────────────────────────────────────────────

  build(): string {
    return this.lines.join("\n") + "\n";
  }

  getSourceMap(): ScadSourceEntry[] {
    return [...this.sourceMapEntries];
  }

  reset(): void {
    this.lines = [];
    this.indentLevel = 0;
    this.sourceMapEntries = [];
  }
}

// ── value formatting helpers ────────────────────────────────

function formatValue(v: unknown): string {
  if (typeof v === "number") return formatNumber(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return `"${v}"`;
  if (Array.isArray(v)) {
    return `[${v.map(formatValue).join(", ")}]`;
  }
  return String(v);
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  // Avoid floating-point noise: max 6 decimal places
  return parseFloat(n.toFixed(6)).toString();
}
