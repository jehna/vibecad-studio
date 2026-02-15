import React from "react";

import Configure from "../icons/Configure";
import Clipping from "../icons/Clipping";
import Download from "../icons/Download";
import ClippingParams from "./ClippingParams";
import { FaceInfo, EdgeInfo } from "./HighlightedInfo";
import { InfoBottomLeft, InfoTopRight } from "../components/FloatingInfo";
import DownloadDialog from "./DownloadDialog";
import ParamsEditor from "./ParamsEditor";
import LoadingScreen from "../components/LoadingScreen";
import EditorViewer from "../viewers/EditorViewer";

import { observer } from "mobx-react";

import useEditorStore from "@/store/useEditorStore";
import { HeaderDropdown } from "./panes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Loading from "../icons/Loading";

export const VisualizerButtons = observer(() => {
  const store = useEditorStore();

  const dropdownItems = [
    { value: "-1", label: "All Shapes" },
    ...store.currentMesh.map((s: any, i: number) => ({
      value: String(i),
      label: s.name,
    })),
  ];

  return (
    <>
      {store.currentMesh.length > 1 && !store.error ? (
        <>
          <HeaderDropdown
            value={String(store.ui.shapeIndex)}
            onValueChange={(v) => store.ui.selectShape(parseInt(v))}
            items={dropdownItems}
          />
          <div className="flex-1" />
        </>
      ) : null}

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
      {!store.ui.currentIsSVG && (
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
      )}
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

  const shape = store.ui.shapeSelected;

  return (
    <>
      {store.shapeLoaded ? (
        <EditorViewer
          shape={shape}
          labels={store.currentLabels}
          hasError={store.hasError}
          clipDirection={store.ui.clip.planeVector}
          clipConstant={store.ui.clip.position}
          onSelected={store.ui.changeHighlight}
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

      {(store.selectedInfo.faceInitialized ||
        store.selectedInfo.edgeInitialized) && (
        <InfoBottomLeft>
          <FaceInfo />
          <EdgeInfo />
        </InfoBottomLeft>
      )}

      {store.hasError && !store.processing && (
        <InfoBottomLeft className="border-red-500 bg-red-950/90 max-w-[min(400px,50vw)]">
          <div className="text-red-400 text-xs font-semibold">Error</div>
          <div className="text-red-200 text-sm mt-1">{store.error?.message}</div>
          {store.error?.stack && (
            <pre className="text-red-300/70 text-[10px] mt-2 overflow-x-auto max-h-24 whitespace-pre-wrap">{store.error.stack}</pre>
          )}
        </InfoBottomLeft>
      )}

      {store.shapeLoaded && store.processing && (
        <InfoBottomLeft noBg className="text-primary-light">
          <Loading size="3em" />
        </InfoBottomLeft>
      )}
    </>
  );
});
