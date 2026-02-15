import type {
  Diagnostic,
  DiagnosticsReport,
  ScadSourceMap,
} from "./types";

/**
 * Parse raw OpenSCAD stderr/error output into structured Diagnostic objects.
 *
 * OpenSCAD error formats:
 *   ERROR: /path/file.scad:12: syntax error
 *   WARNING: /path/file.scad:5: Ignoring unknown module 'foo'
 *   ECHO: "debug message"
 */
export function parseOpenScadOutput(raw: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = raw.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match ERROR: file:line: message
    const errorMatch = trimmed.match(
      /^ERROR:\s*(?:([^:]+):(\d+):\s*)?(.+)/i
    );
    if (errorMatch) {
      diagnostics.push({
        severity: "error",
        message: errorMatch[3],
        scadLocation: errorMatch[2]
          ? { line: parseInt(errorMatch[2], 10) }
          : undefined,
      });
      continue;
    }

    // Match WARNING: file:line: message
    const warnMatch = trimmed.match(
      /^WARNING:\s*(?:([^:]+):(\d+):\s*)?(.+)/i
    );
    if (warnMatch) {
      diagnostics.push({
        severity: "warning",
        message: warnMatch[3],
        scadLocation: warnMatch[2]
          ? { line: parseInt(warnMatch[2], 10) }
          : undefined,
      });
      continue;
    }

    // Match ECHO: messages
    const echoMatch = trimmed.match(/^ECHO:\s*(.+)/i);
    if (echoMatch) {
      diagnostics.push({
        severity: "info",
        message: echoMatch[1],
      });
      continue;
    }

    // Catch-all for unrecognized lines that look like errors
    if (
      trimmed.toLowerCase().includes("error") ||
      trimmed.toLowerCase().includes("fail")
    ) {
      diagnostics.push({
        severity: "error",
        message: trimmed,
      });
    }
  }

  return diagnostics;
}

/**
 * Enrich diagnostics with TypeScript source locations using a source map.
 */
export function mapDiagnosticsToSource(
  diagnostics: Diagnostic[],
  sourceMap?: ScadSourceMap
): Diagnostic[] {
  if (!sourceMap || sourceMap.entries.length === 0) return diagnostics;

  return diagnostics.map((d) => {
    if (!d.scadLocation) return d;

    // Find the closest source map entry at or before this SCAD line
    let closest = sourceMap.entries[0];
    for (const entry of sourceMap.entries) {
      if (entry.scadLine <= d.scadLocation.line) {
        closest = entry;
      }
    }

    return {
      ...d,
      tsLocation: {
        file: closest.tsFile,
        line: closest.tsLine,
      },
    };
  });
}

/**
 * Add remediation suggestions to diagnostics based on common patterns.
 */
export function addSuggestions(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.map((d) => {
    const msg = d.message.toLowerCase();
    let suggestion: string | undefined;

    if (msg.includes("syntax error")) {
      suggestion =
        "Check for missing semicolons or unmatched braces in the generated SCAD";
    } else if (msg.includes("unknown module") || msg.includes("undefined module")) {
      suggestion =
        "The referenced module is not defined. Check that all module declarations are included in the SCAD output";
    } else if (msg.includes("unknown function") || msg.includes("undefined function")) {
      suggestion =
        "The referenced function is not defined. Ensure all function declarations are present";
    } else if (msg.includes("timeout") || msg.includes("timed out")) {
      suggestion =
        "The model is too complex to compile within the time limit. Simplify geometry or reduce $fn values";
    } else if (msg.includes("out of memory") || msg.includes("allocation")) {
      suggestion =
        "Memory limit exceeded. Reduce polygon count, lower $fn, or simplify the model";
    } else if (msg.includes("parameter") && msg.includes("range")) {
      suggestion =
        "A parameter value is outside its declared min/max range. Check parameter constraints";
    }

    return suggestion ? { ...d, suggestion } : d;
  });
}

/**
 * Create a full diagnostics report from compilation output.
 */
export function createDiagnosticsReport(
  modelName: string,
  rawOutput: string,
  scadSource: string,
  success: boolean,
  sourceMap?: ScadSourceMap
): DiagnosticsReport {
  let diagnostics = parseOpenScadOutput(rawOutput);
  diagnostics = mapDiagnosticsToSource(diagnostics, sourceMap);
  diagnostics = addSuggestions(diagnostics);

  return {
    model: modelName,
    timestamp: new Date().toISOString(),
    diagnostics,
    scadSource,
    success,
  };
}

/**
 * Format diagnostics into a human-readable string for console output.
 */
export function formatDiagnosticsForConsole(report: DiagnosticsReport): string {
  const lines: string[] = [];
  lines.push(`[OpenSCAD] Model: ${report.model} — ${report.success ? "SUCCESS" : "FAILED"}`);

  for (const d of report.diagnostics) {
    const severity = d.severity.toUpperCase().padEnd(7);
    let loc = "";
    if (d.tsLocation) {
      loc = ` (${d.tsLocation.file}:${d.tsLocation.line})`;
    } else if (d.scadLocation) {
      loc = ` (SCAD line ${d.scadLocation.line})`;
    }
    lines.push(`  ${severity} ${d.message}${loc}`);
    if (d.suggestion) {
      lines.push(`          ↳ ${d.suggestion}`);
    }
  }

  return lines.join("\n");
}

/**
 * Format diagnostics into a user-facing message suitable for the UI.
 * Groups errors and warnings with counts.
 */
export function formatDiagnosticsForUI(report: DiagnosticsReport): {
  summary: string;
  details: Array<{
    severity: Diagnostic["severity"];
    message: string;
    location?: string;
    suggestion?: string;
  }>;
} {
  const errors = report.diagnostics.filter((d) => d.severity === "error");
  const warnings = report.diagnostics.filter((d) => d.severity === "warning");

  const parts: string[] = [];
  if (errors.length > 0) parts.push(`${errors.length} error${errors.length > 1 ? "s" : ""}`);
  if (warnings.length > 0) parts.push(`${warnings.length} warning${warnings.length > 1 ? "s" : ""}`);

  const summary = report.success
    ? parts.length > 0
      ? `OpenSCAD compiled with ${parts.join(", ")}`
      : "OpenSCAD compiled successfully"
    : `OpenSCAD compilation failed: ${parts.join(", ") || "unknown error"}`;

  const details = report.diagnostics.map((d) => {
    let location: string | undefined;
    if (d.tsLocation) {
      location = `${d.tsLocation.file}:${d.tsLocation.line}`;
    } else if (d.scadLocation) {
      location = `SCAD line ${d.scadLocation.line}`;
    }
    return {
      severity: d.severity,
      message: d.message,
      location,
      suggestion: d.suggestion,
    };
  });

  return { summary, details };
}
