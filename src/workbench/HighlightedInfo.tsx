import React from "react";
import { observer } from "mobx-react";

import useEditorStore from "@/store/useEditorStore";

const formatVector = (data: number[]) => {
  return `[${data.map((c) => c.toFixed(2)).join(", ")}]`;
};

export const FaceInfo = observer(() => {
  const store = useEditorStore();
  if (!store.selectedInfo.faceInfo) return null;
  return (
    <div className="text-[0.9em]">
      <div>
        Face <strong>{store.selectedInfo.currentFace}</strong>
      </div>
      {store.selectedInfo.faceInfo && (
        <>
          <div>
            type: <span className="font-mono">{store.selectedInfo.faceInfo.type}</span>
          </div>
          <div>
            center:{" "}
            <span className="text-[0.8em] font-mono bg-black/10 rounded-[1px] select-all">
              {formatVector(store.selectedInfo.faceInfo?.center)}
            </span>
          </div>
          <div>
            normal:{" "}
            <span className="text-[0.8em] font-mono bg-black/10 rounded-[1px] select-all">
              {formatVector(store.selectedInfo.faceInfo?.normal)}
            </span>
          </div>
        </>
      )}
    </div>
  );
});

export const EdgeInfo = observer(() => {
  const store = useEditorStore();
  if (!store.selectedInfo.edgeInfo) return null;
  return (
    <div className="text-[0.9em]">
      <div>
        Edge <strong>{store.selectedInfo.currentEdge}</strong>
      </div>
      {store.selectedInfo.edgeInfo && (
        <>
          <div>
            type: <span className="font-mono">{store.selectedInfo.edgeInfo.type}</span>
          </div>
          <div>
            start:{" "}
            <span className="text-[0.8em] font-mono bg-black/10 rounded-[1px] select-all">
              {formatVector(store.selectedInfo.edgeInfo?.start)}
            </span>
          </div>
          <div>
            end:{" "}
            <span className="text-[0.8em] font-mono bg-black/10 rounded-[1px] select-all">
              {formatVector(store.selectedInfo.edgeInfo?.end)}
            </span>
          </div>
          <div>
            direction:{" "}
            <span className="text-[0.8em] font-mono bg-black/10 rounded-[1px] select-all">
              {formatVector(store.selectedInfo.edgeInfo?.direction)}
            </span>
          </div>
        </>
      )}
    </div>
  );
});
