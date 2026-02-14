import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router-dom";
import Splitter, { GutterTheme } from "@devbookhq/splitter";

import useEditorStore, {
  EditorContextProvider,
} from "@/store/useEditorStore";

import { Pane } from "./panes";

import EditorPane, { EditorButtons } from "./EditorPane";
import VisualizerPane, { VisualizerButtons } from "./VisualizerPane";
import AutoloadButton from "./Autoload";

export const WorkbenchStructure = observer(function WorkbenchStructure() {
  const store = useEditorStore();
  const { modelSlug } = useParams<{ modelSlug?: string }>();
  useEffect(() => {
    store.initCode(modelSlug);
  }, [store, modelSlug]);

  return (
    <>
      {store.code.listeningFileOnDisk && <AutoloadButton />}
      <Splitter
        gutterTheme={GutterTheme.Dark}
        gutterClassName="custom-gutter-theme"
      >
        {!store.code.listeningFileOnDisk && (
          <Pane aboveOthers buttons={<EditorButtons />}>
            <EditorPane />
          </Pane>
        )}
        <Pane buttons={<VisualizerButtons />}>
          <VisualizerPane />
        </Pane>
      </Splitter>
    </>
  );
});

export default function Workbench() {
  return (
    <div className="h-screen w-screen max-h-screen max-w-screen flex flex-col relative overflow-y-hidden [&_.custom-gutter-theme]:bg-[var(--color-primary-light)] dark:[&_.custom-gutter-theme]:bg-[var(--bg-color)]">
      <EditorContextProvider>
        <WorkbenchStructure />
      </EditorContextProvider>
    </div>
  );
}
