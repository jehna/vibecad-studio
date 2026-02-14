import React from "react";
import debounce from "debounce";
import { observer } from "mobx-react";
import Editor from "@monaco-editor/react";

import replicadTypes from "../../node_modules/replicad/dist/replicad.d.ts?raw";

import Splitter, { GutterTheme, SplitDirection } from "@devbookhq/splitter";

import "./loadMonaco";
import useEditorStore from "@/store/useEditorStore";
import downloadCode from "../utils/downloadCode";
import Download from "../icons/Download";
import Share from "../icons/Share";
import LoadingScreen from "../components/LoadingScreen";
import { LinkEditor } from "../components/LinkEditor";
import { Button as LegacyButton } from "../components/Button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { Dialog, DialogTitle, DialogBody } from "../components/Dialog";
import { useAutoload } from "./Autoload";
import Reload from "../icons/Reload";

export default observer(function EditorPane() {
  const store = useEditorStore();

  const handleEditorDidMount = (_: any, monaco: any) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.javascriptDefaults.setExtraLibs([
      {
        content: `declare module 'replicad' { ${replicadTypes} }`,
      },
      {
        content: `
  import * as replicadAll from 'replicad';
  declare global {
  declare var replicad = replicadAll;
  }
`,
      },
    ]);
  };

  if (!store.code.initialized) return <LoadingScreen />;

  return (
    <>
      <Splitter
        direction={SplitDirection.Vertical}
        gutterTheme={GutterTheme.Dark}
        gutterClassName="custom-gutter-theme"
        initialSizes={store.error ? [75, 25] : [100]}
      >
        <Editor
          defaultLanguage="javascript"
          defaultValue={store.code.current}
          theme="vs-dark"
          height="100%"
          onChange={debounce((e: any) => {
            store.code.update(e, true);
          }, 300)}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
        {store.error && (
          <div className="flex flex-col min-w-full gap-1.5 p-8 border-red-500 border-2 max-w-[50vw] [&>:first-child]:text-red-500 [&>:nth-child(2)]:text-lg [&>pre]:text-xs [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:text-gray-600 [&>pre]:bg-[#f2e0de]">
            <div>Error</div>
            <div>{store.error?.message}</div>
            {store.error.stack && <pre>{store.error.stack}</pre>}
            {store.exceptionMode == "single" && (
              <div className="flex justify-end">
                <LegacyButton onClick={store.toggleExceptions}>
                  Enable full exception mode
                </LegacyButton>
              </div>
            )}
          </div>
        )}
      </Splitter>
      {store.exceptionMode == "withExceptions" && (
        <div className="p-8 text-[0.7em] absolute h-[100px] w-full bottom-0 bg-[#f2e0de]">
          <div>
            You are currently in full exception mode. This means that the
            computations are slower but will give you better information about
            kernel errors.
          </div>
          <div className="flex justify-end">
            <LegacyButton onClick={store.toggleExceptions}>
              Disable full exception mode
            </LegacyButton>
          </div>
        </div>
      )}
    </>
  );
});

const ShareDialog = observer(({ onClose }: { onClose: () => void }) => {
  const store = useEditorStore();

  return (
    <Dialog onClose={onClose}>
      <DialogTitle onClose={onClose}>Your shareable links</DialogTitle>
      <DialogBody>
        <div style={{ maxWidth: "60vw" }}>
          <LinkEditor fromCode={store.code.current} />
        </div>
      </DialogBody>
    </Dialog>
  );
});

export const EditorButtons = observer(() => {
  const store = useEditorStore();
  const [share, setShare] = React.useState(false);

  const toggleAutoload = useAutoload();

  const download = () => {
    const shapeName =
      store.currentMesh.length === 1 ? (store.currentMesh[0] as any)?.name : null;
    return downloadCode(store.code.current, shapeName);
  };

  const filePickerSupported = (window as any).showOpenFilePicker !== undefined;

  return (
    <>
      {filePickerSupported && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
                onClick={toggleAutoload}
              >
                <Reload />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle autoreload</TooltipContent>
          </Tooltip>
          <div className="flex-1" />
        </>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
            onClick={() => setShare(true)}
          >
            <Share />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
            onClick={download}
          >
            <Download />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download</TooltipContent>
      </Tooltip>
      {share && <ShareDialog onClose={() => setShare(false)} />}
    </>
  );
});
