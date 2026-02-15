import { describe, it, expect } from "vitest";
import {
  parseOpenScadOutput,
  mapDiagnosticsToSource,
  addSuggestions,
  createDiagnosticsReport,
  formatDiagnosticsForConsole,
  formatDiagnosticsForUI,
} from "../src/openscad/diagnostics";

describe("parseOpenScadOutput", () => {
  it("parses ERROR lines with file and line info", () => {
    const raw = "ERROR: /tmp/input.scad:12: syntax error";
    const diags = parseOpenScadOutput(raw);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("error");
    expect(diags[0].message).toBe("syntax error");
    expect(diags[0].scadLocation?.line).toBe(12);
  });

  it("parses ERROR lines without file info", () => {
    const raw = "ERROR: No top level geometry to render";
    const diags = parseOpenScadOutput(raw);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("error");
    expect(diags[0].message).toBe("No top level geometry to render");
    expect(diags[0].scadLocation).toBeUndefined();
  });

  it("parses WARNING lines", () => {
    const raw = "WARNING: /tmp/input.scad:5: Ignoring unknown module 'foo'";
    const diags = parseOpenScadOutput(raw);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("warning");
    expect(diags[0].message).toBe("Ignoring unknown module 'foo'");
    expect(diags[0].scadLocation?.line).toBe(5);
  });

  it("parses ECHO lines", () => {
    const raw = 'ECHO: "debug value = 42"';
    const diags = parseOpenScadOutput(raw);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
    expect(diags[0].message).toBe('"debug value = 42"');
  });

  it("parses mixed output", () => {
    const raw = [
      'ECHO: "starting"',
      "WARNING: /tmp/input.scad:3: deprecated function",
      "ERROR: /tmp/input.scad:10: syntax error",
    ].join("\n");

    const diags = parseOpenScadOutput(raw);
    expect(diags).toHaveLength(3);
    expect(diags[0].severity).toBe("info");
    expect(diags[1].severity).toBe("warning");
    expect(diags[2].severity).toBe("error");
  });

  it("ignores blank lines", () => {
    const raw = "\n\n\n";
    expect(parseOpenScadOutput(raw)).toEqual([]);
  });
});

describe("mapDiagnosticsToSource", () => {
  it("maps SCAD line numbers to TS source locations", () => {
    const diags = [
      { severity: "error" as const, message: "syntax error", scadLocation: { line: 5 } },
    ];
    const sourceMap = {
      entries: [
        { scadLine: 1, tsLine: 10, tsFile: "model.ts" },
        { scadLine: 4, tsLine: 20, tsFile: "model.ts" },
        { scadLine: 8, tsLine: 30, tsFile: "model.ts" },
      ],
    };

    const mapped = mapDiagnosticsToSource(diags, sourceMap);
    expect(mapped[0].tsLocation?.line).toBe(20);
    expect(mapped[0].tsLocation?.file).toBe("model.ts");
  });

  it("returns unchanged diagnostics without source map", () => {
    const diags = [{ severity: "error" as const, message: "err" }];
    expect(mapDiagnosticsToSource(diags)).toEqual(diags);
    expect(mapDiagnosticsToSource(diags, undefined)).toEqual(diags);
  });
});

describe("addSuggestions", () => {
  it("suggests fix for syntax errors", () => {
    const diags = [{ severity: "error" as const, message: "syntax error near }" }];
    const result = addSuggestions(diags);
    expect(result[0].suggestion).toContain("semicolons");
  });

  it("suggests fix for unknown modules", () => {
    const diags = [{ severity: "warning" as const, message: "Ignoring unknown module 'bolt'" }];
    const result = addSuggestions(diags);
    expect(result[0].suggestion).toContain("module");
  });

  it("suggests fix for timeout", () => {
    const diags = [{ severity: "error" as const, message: "OpenSCAD compilation timed out" }];
    const result = addSuggestions(diags);
    expect(result[0].suggestion).toContain("$fn");
  });

  it("does not add suggestions to unrecognized messages", () => {
    const diags = [{ severity: "info" as const, message: "something else" }];
    const result = addSuggestions(diags);
    expect(result[0].suggestion).toBeUndefined();
  });
});

describe("createDiagnosticsReport", () => {
  it("creates a report with parsed diagnostics", () => {
    const report = createDiagnosticsReport(
      "test-model",
      "ERROR: /tmp/input.scad:5: syntax error",
      "cube(10);",
      false
    );

    expect(report.model).toBe("test-model");
    expect(report.success).toBe(false);
    expect(report.diagnostics).toHaveLength(1);
    expect(report.scadSource).toBe("cube(10);");
    expect(report.timestamp).toBeDefined();
  });
});

describe("formatDiagnosticsForConsole", () => {
  it("formats diagnostics as readable string", () => {
    const report = createDiagnosticsReport(
      "bolt",
      "ERROR: /tmp/input.scad:5: syntax error",
      "cube(10);",
      false
    );

    const output = formatDiagnosticsForConsole(report);
    expect(output).toContain("[OpenSCAD]");
    expect(output).toContain("bolt");
    expect(output).toContain("FAILED");
    expect(output).toContain("syntax error");
  });
});

describe("formatDiagnosticsForUI", () => {
  it("produces summary and details for the frontend", () => {
    const report = createDiagnosticsReport(
      "bolt",
      "ERROR: line:5: bad input\nWARNING: line:3: deprecated",
      "scad code here",
      false
    );

    const ui = formatDiagnosticsForUI(report);
    expect(ui.summary).toContain("failed");
    expect(ui.details.length).toBeGreaterThan(0);
    expect(ui.details[0].severity).toBe("error");
  });

  it("produces success summary when no errors", () => {
    const report = createDiagnosticsReport("ok-model", "", "cube(10);", true);
    const ui = formatDiagnosticsForUI(report);
    expect(ui.summary).toContain("successfully");
    expect(ui.details).toHaveLength(0);
  });
});
