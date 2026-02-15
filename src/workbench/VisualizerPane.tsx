import React from "react";

import Configure from "../icons/Configure";
import Clipping from "../icons/Clipping";
import Download from "../icons/Download";
import ClippingParams from "./ClippingParams";
import { InfoTopRight } from "../components/FloatingInfo";
import { InfoBottomLeft } from "../components/FloatingInfo";
import DownloadDialog from "./DownloadDialog";
import ParamsEditor from "./ParamsEditor";
import LoadingScreen from "../components/LoadingScreen";
import EditorViewer from "../viewers/EditorViewer";
import ErrorPanel from "../components/ErrorPanel";

import { observer } from "mobx-react";

import useEditorStore from "@/store/useEditorStore";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Loading from "../icons/Loading";

export const VisualizerButtons = observer(() => {
  const store = useEditorStore();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
            onClick={() => store.ui.changeDownload(true)}
          >
            <Download />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={!store.ui.clip.disabled ? "secondary" : "ghost"}
            size="icon"
            className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
            onClick={() => store.ui.clip.toggle()}
          >
            <Clipping />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clipping plane</TooltipContent>
      </Tooltip>
      {store.defaultParams && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={store.ui.enableParams ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
              onClick={() =>
                store.ui.changeEnableParams(!store.ui.enableParams)
              }
            >
              <Configure />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Parameters</TooltipContent>
        </Tooltip>
      )}
    </>
  );
});

export default observer(function VisualizerPane() {
  const store = useEditorStore();

  return (
    <>
      {store.shapeLoaded ? (
        <EditorViewer
          stl={store.currentMesh?.stl ?? null}
          hasError={store.hasError}
          clipDirection={store.ui.clip.planeVector}
          clipConstant={store.ui.clip.position}
        />
      ) : (
        <LoadingScreen />
      )}
      {(!store.ui.clip.disabled ||
        (store.ui.enableParams && store.defaultParams)) && (
        <InfoTopRight>
          {!store.ui.clip.disabled && <ClippingParams />}
          {store.ui.enableParams && store.defaultParams && (
            <ParamsEditor
              defaultParams={store.defaultParams}
              onRun={store.process}
            />
          )}
        </InfoTopRight>
      )}
      {store.ui.showDownload && (
        <DownloadDialog onClose={() => store.ui.changeDownload(false)} />
      )}

      <ErrorPanel />

      {store.shapeLoaded && store.processing && (
        <InfoBottomLeft noBg className="text-primary-light">
          <Loading size="3em" />
        </InfoBottomLeft>
      )}
    </>
  );
});
