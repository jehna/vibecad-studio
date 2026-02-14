import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router-dom";

import useEditorStore, {
  EditorContextProvider,
} from "@/store/useEditorStore";

import api from "@/utils/builderAPI";

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

  // HMR: when model files change in dev, reload the model in the worker
  useEffect(() => {
    if (!modelSlug || !import.meta.hot) return;

    const handler = (data: { slug: string }) => {
      if (data.slug === modelSlug) {
        api.reloadModel(modelSlug).then(() => {
          store.process();
        });
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
