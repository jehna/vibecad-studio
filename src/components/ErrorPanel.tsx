import React, { useState } from "react";
import { observer } from "mobx-react";
import useEditorStore from "@/store/useEditorStore";

export default observer(function ErrorPanel() {
  const store = useEditorStore();
  const [collapsed, setCollapsed] = useState(false);

  if (store.errors.length === 0 && store.logs.length === 0) return null;

  const hasErrors = store.errors.length > 0;

  if (collapsed) {
    return (
      <button
        className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded bg-zinc-900/90 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
        onClick={() => setCollapsed(false)}
      >
        Console
        {hasErrors && (
          <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
            {store.errors.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 max-h-48 overflow-auto bg-zinc-900/95 border-t border-zinc-700">
      <div className="flex items-center justify-between px-3 py-1 border-b border-zinc-700">
        <span className="text-xs font-medium text-zinc-400">
          Console
          {hasErrors && (
            <span className="ml-2 text-red-400">
              {store.errors.length} error{store.errors.length > 1 ? "s" : ""}
            </span>
          )}
        </span>
        <button
          className="text-xs text-zinc-500 hover:text-zinc-300"
          onClick={() => setCollapsed(true)}
        >
          Collapse
        </button>
      </div>
      <pre className="p-2 text-xs leading-relaxed">
        {store.errors.map((line, i) => (
          <div
            key={`err-${i}`}
            className={
              line.toUpperCase().includes("WARNING")
                ? "text-yellow-400"
                : "text-red-400"
            }
          >
            {line}
          </div>
        ))}
        {store.logs.map((line, i) => (
          <div key={`log-${i}`} className="text-zinc-400">
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
});
