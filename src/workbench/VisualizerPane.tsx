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
import { HeaderButton, HeaderSelect } from "./panes";
import Loading from "../icons/Loading";

export const VisualizerButtons = observer(() => {
  const store = useEditorStore();

  return (
    <>
      {store.currentMesh.length > 1 && !store.error ? (
        <>
          <HeaderSelect
            value={store.ui.shapeIndex}
            onChange={(e: any) => store.ui.selectShape(parseInt(e.target.value))}
          >
            <option value={-1}>All Shapes</option>
            {store.currentMesh.map((s: any, i: number) => (
              <option value={i} key={s.name}>
                {s.name}
              </option>
            ))}
          </HeaderSelect>
          <div className="flex-1" />
        </>
      ) : null}

      <HeaderButton
        onClick={() => store.ui.changeDownload(true)}
        title="Download"
      >
        <Download />
      </HeaderButton>
      {!store.ui.currentIsSVG && (
        <HeaderButton
          solid={!store.ui.clip.disabled}
          onClick={() => store.ui.clip.toggle()}
          title="Clipping plane"
        >
          <Clipping />
        </HeaderButton>
      )}
      {store.defaultParams && (
        <HeaderButton
          solid={store.ui.enableParams}
          onClick={() => store.ui.changeEnableParams(!store.ui.enableParams)}
          title="Parameters"
        >
          <Configure />
        </HeaderButton>
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

      {store.shapeLoaded && store.processing && (
        <InfoBottomLeft noBg className="text-[var(--color-primary-light)]">
          <Loading size="3em" />
        </InfoBottomLeft>
      )}
    </>
  );
});
