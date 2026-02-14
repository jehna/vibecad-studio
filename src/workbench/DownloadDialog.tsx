import React, { useState } from "react";
import { renderToString } from "react-dom/server";

import { fileSave } from "browser-fs-access";

import { Button, ButtonBar } from "../components/Button";
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogButtons,
} from "../components/Dialog";

import saveShape from "@/utils/saveShape";
import useEditorStore from "@/store/useEditorStore";
import SVGViewer from "../viewers/SVGViewer";

export default function DownloadDialog({ onClose }: { onClose: () => void }) {
  const store = useEditorStore();

  const isSVG = (store.currentMesh as any)[0]?.format === "svg";

  const [saveMode, setSaveMode] = useState(isSVG ? "svg" : "step");

  const onDownload = async () => {
    if (saveMode === "svg") {
      await fileSave(
        new Blob(
          [
            renderToString(
              <SVGViewer
                shape={store.currentMesh}
                withGrid={false}
                rawWindow
                defaultColor="black"
              />
            ),
          ],
          {
            type: "image/svg+xml",
          }
        ),
        {
          id: "exports",
          fileName: `${
            store.currentMesh.length === 1
              ? (store.currentMesh as any)[0]?.name
              : "replicad-image"
          }.svg`,
          description: "SVG file of the current geometry",
          extensions: [".svg"],
        }
      );
    } else if (saveMode === "json") {
      await fileSave(
        new Blob([JSON.stringify(store.currentMesh)], {
          type: "application/json",
        }),
        {
          id: "exports",
          fileName: "defaultGeometry.json",
          description: "JSON file containing the geometry",
          extensions: [".json"],
        }
      );
    } else {
      try {
        await saveShape("defaultShape", saveMode, store.code.current);
      } catch (e) {
        console.error(e);
      } finally {
        console.log("ending");
      }
    }

    onClose();
  };

  return (
    <Dialog onClose={onClose}>
      <DialogTitle onClose={onClose}>Download this model</DialogTitle>
      <DialogBody>
        <p>Select the format:</p>

        <div className="flex flex-row gap-8 row-gap-4 flex-wrap [&>label]:flex [&>label>:not(:last-child)]:mr-2">
          {isSVG ? (
            <label>
              <input
                checked={saveMode === "svg"}
                type="radio"
                onClick={() => setSaveMode("svg")}
                readOnly
              />
              <span>SVG</span>
            </label>
          ) : (
            <>
              <label>
                <input
                  checked={saveMode === "step"}
                  type="radio"
                  onClick={() => setSaveMode("step")}
                  readOnly
                />
                <span>STEP</span>
              </label>
              <label>
                <input
                  checked={saveMode === "step-assembly"}
                  type="radio"
                  onClick={() => setSaveMode("step-assembly")}
                  readOnly
                />
                <span>STEP assembly</span>
              </label>
              <label>
                <input
                  checked={saveMode === "stl"}
                  type="radio"
                  onClick={() => setSaveMode("stl")}
                  readOnly
                />
                <span>STL</span>
              </label>
              <label>
                <input
                  checked={saveMode === "stl-binary"}
                  type="radio"
                  onClick={() => setSaveMode("stl-binary")}
                  readOnly
                />
                <span>STL (binary)</span>
              </label>
            </>
          )}
          <label>
            <input
              checked={saveMode === "json"}
              type="radio"
              onClick={() => setSaveMode("json")}
              readOnly
            />
            <span>JSON</span>
          </label>
        </div>
      </DialogBody>
      <DialogButtons>
        <ButtonBar>
          <Button onClick={onClose}>Close</Button>
          <Button solid onClick={onDownload}>
            Download
          </Button>
        </ButtonBar>
      </DialogButtons>
    </Dialog>
  );
}
