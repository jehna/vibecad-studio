import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";

import { ParamsSection, LabelledBlock } from "../components/ToolUI";

import useEditorStore from "@/store/useEditorStore";

const NumberEditor = React.memo(function NumberEditor({
  value,
  onChange,
  ...props
}: any) {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);

    if (Number.isFinite(parsed)) {
      onChange(parsed);
      setVal(parsed);
    } else {
      setVal(value);
    }
  };

  return (
    <input
      type="number"
      onChange={handleChange}
      value={val}
      className="text-right outline-none text-inherit font-inherit border-none appearance-none px-1.5 h-6 leading-[1.15] rounded-[3px] bg-card hover:shadow-[inset_0_0_0_1px_var(--color-primary)]"
      {...props}
    />
  );
});

const PLANE_TO_NORMAL: Record<string, string> = {
  XY: "Z",
  YZ: "X",
  XZ: "Y",
};

export default observer(function ClippingParams() {
  const store = useEditorStore();
  return (
    <ParamsSection>
      <LabelledBlock label="Clipping Planes">
        <div className="flex justify-between mb-2 bg-background [&>label]:flex [&>label]:items-center">
          <label>
            <input
              onClick={() => store.ui.clip.setPlane("XY")}
              checked={store.ui.clip.plane === "XY"}
              type="radio"
              readOnly
            />
            <span className="mx-0.5 text-center text-primary">XY</span>
          </label>
          <label>
            <input
              onClick={() => store.ui.clip.setPlane("XZ")}
              checked={store.ui.clip.plane === "XZ"}
              type="radio"
              readOnly
            />
            <span className="mx-0.5 text-center text-primary">XZ</span>
          </label>
          <label>
            <input
              onClick={() => store.ui.clip.setPlane("YZ")}
              checked={store.ui.clip.plane === "YZ"}
              type="radio"
              readOnly
            />
            <span className="mx-0.5 text-center text-primary">YZ</span>
          </label>
        </div>
      </LabelledBlock>
      <LabelledBlock
        label={`${PLANE_TO_NORMAL[store.ui.clip.plane]} position`}
        labelFor="clippingPosition"
      >
        <NumberEditor
          id="clippingPosition"
          value={store.ui.clip.constant}
          onChange={(v: number) => store.ui.clip.setConstant(v)}
        />
      </LabelledBlock>
    </ParamsSection>
  );
});
