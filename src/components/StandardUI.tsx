import React, { useRef, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import { useControls, levaStore, Leva } from "leva";

import Download from "../icons/Download";
import Configure from "../icons/Configure";
import Focus from "../icons/Focus";
import NewWindow from "../icons/NewWindow";
import Loading from "../icons/Loading";

import { InfoMenu, ContextButton } from "./ButtonMenu";
import LoadingScreen from "./LoadingScreen";
import { InfoBottomLeft } from "./FloatingInfo";

import PresentationViewer from "../viewers/PresentationViewer";
import NicePresentationViewer from "../viewers/NicePresentationViewer";

const AutoConfig = ({ updateParams, defaultParams, hidden, collapsed }: any) => {
  const [params] = useControls(() => defaultParams);
  const paramsUpdater = useRef(updateParams);

  useEffect(() => {
    paramsUpdater.current = updateParams;
  }, [updateParams]);

  useEffect(() => {
    paramsUpdater.current(params);
  }, [params]);

  useEffect(
    () => () => {
      levaStore.dispose();
    },
    []
  );

  return (
    <Leva
      hideCopyButton
      collapsed={collapsed}
      hidden={hidden}
      theme={{
        colors: {
          elevation1: "var(--bg-color-secondary)",
          elevation2: "var(--bg-color)",
          elevation3: "var(--bg-color-secondary)",

          highlight1: "var(--color-primary)",
          highlight2: "var(--color-primary)",
          highlight3: "var(--color-primary-dark)",

          accent1: "var(--color-primary)",
          accent2: "var(--color-primary-light)",
          accent3: "var(--color-primary-dark)",

          vivid1: "red",
        },
        sizes: {
          rootWidth: null,
          controlWidth: "150px",
        },
      }}
    />
  );
};

const useDisplayMode = () => {
  const { search } = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(search);

  const niceViewer = searchParams.has("display");
  const toggleView = () => {
    if (niceViewer) searchParams.delete("display");
    else searchParams.set("display", "true");

    history.replace({ search: searchParams.toString() });
  };
  return [niceViewer, toggleView] as const;
};

export default function StandardUI({
  computedShapes,
  computedLabels,
  defaultParams,
  updateParams,
  disableAutoPosition,
  disableDamping,
  showParams,
  disableMenus,
  orthographicCamera,
  hideGrid,
  onSave,
  canSave,
  isLoading,
}: any) {
  const isInIframe = window.location !== window.parent.location;
  const [niceViewer, toggleNiceViewer] = useDisplayMode();
  const Viewer = niceViewer ? NicePresentationViewer : PresentationViewer;

  return (
    <>
      {computedShapes?.length ? (
        <Viewer
          shapes={computedShapes}
          labels={computedLabels}
          orthographicCamera={orthographicCamera}
          hideGrid={hideGrid}
          disableDamping={disableDamping}
          disableAutoPosition={disableAutoPosition}
        />
      ) : (
        <LoadingScreen />
      )}

      {defaultParams && !disableMenus && (
        <AutoConfig
          hidden={niceViewer}
          collapsed={!showParams}
          defaultParams={defaultParams}
          updateParams={updateParams}
        />
      )}
      {!disableMenus && (
        <InfoMenu noBg hide={niceViewer as boolean}>
          <ContextButton onClick={toggleNiceViewer as () => void}>
            {niceViewer ? <Configure /> : <Focus />}
          </ContextButton>
          {!niceViewer && (
            <>
              <ContextButton
                disabled={!canSave}
                onClick={() => onSave("stl")}
              >
                <Download text="STL" />
              </ContextButton>
              <ContextButton
                disabled={!canSave}
                onClick={() => onSave("step")}
              >
                <Download text="STEP" />
              </ContextButton>
            </>
          )}
          {isInIframe && (
            <ContextButton
              onClick={() => window.open(window.location.href, "_blank")}
            >
              <NewWindow />
            </ContextButton>
          )}
        </InfoMenu>
      )}
      {isLoading && !!computedShapes?.length && (
        <InfoBottomLeft noBg className={niceViewer ? "opacity-0 hover:opacity-100 transition-opacity" : ""}>
          <Loading size="3em" />
        </InfoBottomLeft>
      )}
    </>
  );
}
