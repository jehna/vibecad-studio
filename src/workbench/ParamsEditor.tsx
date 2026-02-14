import React, { useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useControls, levaStore, Leva } from "leva";

export default observer(function ParamsEditor({
  defaultParams,
  hidden,
  onRun,
}: {
  defaultParams: any;
  hidden?: boolean;
  onRun: (params: any) => void;
}) {
  const runFcn = useRef(onRun);
  useEffect(() => {
    runFcn.current = onRun;
  }, [onRun]);

  const paramsConfig = useMemo(() => {
    return {
      _run: {
        type: "BUTTON" as const,
        onClick: (get: (key: string) => any) =>
          runFcn.current(
            Object.fromEntries(
              levaStore
                .getVisiblePaths()
                .filter((f: string) => f !== "_run")
                .map((f: string) => [f, get(f)])
            )
          ),
        settings: { disabled: false },
        label: "Apply params",
      },
      ...defaultParams,
    };
  }, [defaultParams]);

  useControls(() => paramsConfig, [defaultParams]);

  useEffect(
    () => () => {
      levaStore.dispose();
    },
    []
  );

  return (
    <Leva
      fill
      flat
      hideCopyButton
      titleBar={false}
      hidden={hidden}
      theme={{
        colors: {
          elevation1: "white",
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
          controlWidth: "150px",
        },
      }}
    />
  );
});
