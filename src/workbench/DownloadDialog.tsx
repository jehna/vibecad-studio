import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogBody,
  DialogButtons,
} from "../components/Dialog";

import saveStl from "@/utils/saveShape";
import useEditorStore from "@/store/useEditorStore";

export default function DownloadDialog({ onClose }: { onClose: () => void }) {
  const store = useEditorStore();

  const onDownload = async () => {
    const stl = store.currentMesh?.stl;
    if (!stl) return;

    try {
      await saveStl(stl, store.config.modelSlug || "model");
    } catch (e) {
      console.error(e);
    }

    onClose();
  };

  return (
    <Dialog onClose={onClose}>
      <DialogTitle onClose={onClose}>Download this model</DialogTitle>
      <DialogBody>
        <p>Download the current model as an STL file.</p>
      </DialogBody>
      <DialogButtons>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            onClick={onDownload}
            disabled={!store.currentMesh?.stl}
          >
            Download STL
          </Button>
        </div>
      </DialogButtons>
    </Dialog>
  );
}
