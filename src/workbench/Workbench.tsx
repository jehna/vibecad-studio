import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router-dom";

import useEditorStore, {
  EditorContextProvider,
} from "@/store/useEditorStore";

import { Pane } from "./panes";
import { TooltipProvider } from "@/components/ui/tooltip";

import VisualizerPane, { VisualizerButtons } from "./VisualizerPane";

export const WorkbenchStructure = observer(function WorkbenchStructure() {
  const store = useEditorStore();
  const { modelSlug } = useParams();

  useEffect(() => {
    if (modelSlug) {
      store.initModel(modelSlug);
    }
  }, [store, modelSlug]);

  // HMR: when .scad files change in dev, re-import raw source and re-render
  useEffect(() => {
    if (!modelSlug || !import.meta.hot) return;

    const handler = async (data: { slug: string }) => {
      if (data.slug === modelSlug) {
        // Re-import the raw .scad source with cache-busting
        const mod = await import(
          /* @vite-ignore */
          `../models/${modelSlug}/model.scad?raw&t=${Date.now()}`
        );
        store.updateSource(mod.default);
        store.process();
      }
    };

    import.meta.hot.on("model-update", handler);
    return () => {
      import.meta.hot!.off("model-update", handler);
    };
  }, [store, modelSlug]);

  return (
    <Pane buttons={<VisualizerButtons />}>
      <VisualizerPane />
    </Pane>
  );
});

export default function Workbench() {
  return (
    <TooltipProvider>
      <div className="h-screen w-screen max-h-screen max-w-screen flex flex-col relative overflow-y-hidden">
        <EditorContextProvider>
          <WorkbenchStructure />
        </EditorContextProvider>
      </div>
    </TooltipProvider>
  );
}
