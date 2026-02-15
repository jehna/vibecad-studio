import React from "react";

interface DiagnosticDetail {
  severity: "error" | "warning" | "info";
  message: string;
  location?: string;
  suggestion?: string;
}

interface OpenScadDiagnosticsProps {
  summary: string;
  details: DiagnosticDetail[];
  scadSource?: string;
}

const severityStyles: Record<string, string> = {
  error: "text-red-600 before:content-['✕'] before:mr-1.5 before:font-bold",
  warning: "text-amber-600 before:content-['⚠'] before:mr-1.5",
  info: "text-blue-600 before:content-['ℹ'] before:mr-1.5",
};

export default function OpenScadDiagnostics({
  summary,
  details,
  scadSource,
}: OpenScadDiagnosticsProps) {
  const [showScad, setShowScad] = React.useState(false);

  return (
    <div className="text-sm space-y-2">
      <div className="font-medium">{summary}</div>

      {details.length > 0 && (
        <ul className="space-y-1.5">
          {details.map((d, i) => (
            <li key={i} className={`${severityStyles[d.severity] ?? ""} text-xs`}>
              <span>{d.message}</span>
              {d.location && (
                <span className="ml-1 text-gray-500">({d.location})</span>
              )}
              {d.suggestion && (
                <div className="ml-4 text-gray-500 italic">{d.suggestion}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {scadSource && (
        <>
          <button
            onClick={() => setShowScad((v) => !v)}
            className="text-xs text-blue-500 underline cursor-pointer"
          >
            {showScad ? "Hide" : "Show"} generated SCAD
          </button>
          {showScad && (
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto max-h-60 overflow-y-auto">
              {scadSource}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
