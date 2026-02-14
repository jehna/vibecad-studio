import React, { useCallback } from "react";

import { Button } from "../components/Button";
import { clearFileSave, loadFile, requestFile } from "../utils/diskFileAccess";
import Reload from "../icons/Reload";
import useEditorStore from "@/store/useEditorStore";
import { observer } from "mobx-react";
import { InfoBottomLeft } from "../components/FloatingInfo";

export const useAutoload = () => {
  const store = useEditorStore();

  const toggleAutoload = useCallback(async () => {
    if (store.code.listeningFileOnDisk) {
      store.code.stopListening();
      clearFileSave();
    }

    let file = await loadFile();
    if (!file) {
      file = await requestFile();
    }
    if (file) {
      store.code.startListening(file);
    } else {
      alert("Your browser does not support this feature.");
    }
  }, [store]);

  return toggleAutoload;
};

export default observer(function AutoloadButton() {
  const store = useEditorStore();
  const toggleAutoload = useAutoload();

  return (
    <>
      <div className="absolute top-10 left-4 z-[1000]">
        <Button solid={store.code.listeningFileOnDisk} onClick={toggleAutoload}>
          <Reload />
        </Button>
      </div>
      {store.error && (
        <InfoBottomLeft className="border-red-500 bg-white border-2 z-[1000] max-w-[50vw] [&>:first-child]:text-red-500 [&>:nth-child(2)]:text-lg [&>pre]:text-xs [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:bg-[#f2e0de]">
          <div>Error</div>
          <div>{store.error?.message}</div>
          {store.error.stack && <pre>{store.error.stack}</pre>}

          <div className="flex justify-end">
            <Button onClick={store.toggleExceptions}>
              Toggle full exceptions
            </Button>
          </div>
        </InfoBottomLeft>
      )}
      {!store.error && store.exceptionMode == "withExceptions" && (
        <InfoBottomLeft className="border-[var(--color-primary-light)] bg-white border-2 z-[1000] max-w-[50vw]">
          <div>
            You are currently in full exception mode. This means that the
            computations are slower but will give you better information about
            kernel errors.
          </div>
          <div className="flex justify-end">
            <Button onClick={store.toggleExceptions}>
              Disable full exception mode
            </Button>
          </div>
        </InfoBottomLeft>
      )}
    </>
  );
});
