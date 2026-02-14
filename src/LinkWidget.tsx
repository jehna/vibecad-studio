import React, { useRef, useState, useEffect, useCallback } from "react";

import { useParams } from "react-router-dom";
import axios from "axios";

import builderAPI from "./utils/builderAPI";
import loadCode from "./utils/loadCode";
import saveShape from "./utils/saveShape";

import StandardUI from "./components/StandardUI";
import { LinkEditor } from "./components/LinkEditor";

const TEST_URL =
  "https%3A%2F%2Fraw.githubusercontent.com%2Fsgenoud%2Freplicad%2Fmain%2Fpackages%2Freplicad-docs%2Fexamples%2FsimpleVase.js";

const useCode = (readyToBuild: React.MutableRefObject<boolean>, setError: (e: any) => void) => {
  let { shapeURL } = useParams<{ shapeURL?: string }>();
  const [code, setCode] = useState<string | null>(null);

  const [rawCode, setRawCode] = useState<string | null>(null);

  if (!shapeURL) {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    if (hashParams.has("url")) {
      shapeURL = hashParams.get("url")!;
    }
  }

  const codeUrl = decodeURIComponent(
    shapeURL === "test-shape" ? TEST_URL : shapeURL!
  );

  useEffect(() => {
    if (shapeURL) {
      loadCodeFromUrl();
    } else {
      loadCodeFromParam();
    }

    async function loadCodeFromUrl() {
      try {
        const response = await axios.get(codeUrl);
        setCode(response.data);
        readyToBuild.current = true;
      } catch (e) {
        console.error(e);
        setError({ type: "url", codeUrl: codeUrl });
      }
    }

    async function loadCodeFromParam() {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      if (!hashParams.has("code")) {
        setError({ type: "code" });
        return;
      }
      try {
        const rawCode = hashParams.get("code")!;
        setCode(await loadCode(rawCode));
        setRawCode(rawCode);
        readyToBuild.current = true;
      } catch (e) {
        setError({ type: "code" });
      }
    }
  }, [shapeURL]);

  const url = new URL(window.location.href);
  url.pathname = "/workbench";
  url.hash = "";
  url.search = "";
  if (shapeURL) {
    url.searchParams.set("from-url", shapeURL);
  } else {
    const hashParams = new URLSearchParams();
    hashParams.set("code", rawCode!);
    url.hash = hashParams.toString();
  }
  const workbenchUrl = url.toString();

  let downloadURL: string | false = shapeURL && codeUrl;
  if (!downloadURL) {
    downloadURL = URL.createObjectURL(
      new Blob([code!], {
        type: "application/javascript",
      })
    );
  }

  const updateCode = (newCode: string) => {
    if (newCode === code) return;
    setCode(newCode);
    setError(null);
  };

  return { code, workbenchUrl, downloadURL, setCode: updateCode };
};

export default function LinkWidget() {
  const [computedShapes, updateComputedShapes] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [labels, setLabels] = useState<any[]>([]);

  const [geometryHasBeenComputed, setGeometryHasBeenComputed] = useState(false);
  const [defaultParams, setDefaultParams] = useState<any>(null);
  const paramsToCompute = useRef<any>(null);
  const readyToBuild = useRef(false);
  const lastParams = useRef<any>({});

  const { code, workbenchUrl, downloadURL, setCode } = useCode(
    readyToBuild,
    setError
  );

  useEffect(() => {
    if (!code) return;

    builderAPI
      .extractDefaultParamsFromCode(code)
      .then((defaultParams: any) => {
        setDefaultParams(defaultParams || {});
      })
      .catch(() => setError({ type: "url" }));

    return () => {
      paramsToCompute.current = null;
      updateComputedShapes([]);
      setDefaultParams(null);
    };
  }, [code]);

  const build = useCallback(
    (buildParams?: any) => {
      setIsLoading(true);
      builderAPI
        .ready()
        .then(() => {
          readyToBuild.current = false;
          return builderAPI.buildShapesFromCode(code, buildParams);
        })
        .then((geometry: any) => {
          updateComputedShapes(geometry);
          setGeometryHasBeenComputed(true);
          readyToBuild.current = true;
          setIsLoading(false);
          if (paramsToCompute.current) {
            build({ ...paramsToCompute.current });
            paramsToCompute.current = null;
          }
        })
        .then(() => {
          return builderAPI.computeLabels(code, buildParams);
        })
        .then((labels: any) => {
          setLabels(labels);
          lastParams.current = buildParams;
        });
    },
    [code]
  );

  const updateParams = useCallback(
    (newParams: any) => {
      if (readyToBuild.current && code) build(newParams);
      else {
        paramsToCompute.current = newParams;
      }
    },
    [build, code]
  );

  useEffect(() => {
    build();
  }, [build]);

  const loadFont = useCallback(
    async (fontData: any, fontName: string, forceUpdate: boolean) => {
      await builderAPI.ready();
      await builderAPI.loadFont(fontData, fontName, forceUpdate);
    },
    []
  );

  const searchParams = new URLSearchParams(window.location.search);
  const checkParam = (paramName: string) => {
    return searchParams.get(paramName)?.toLowerCase() === "true";
  };

  useEffect(() => {
    if (!checkParam("enable-post-message-mode")) return;
    if (defaultParams) updateParams(defaultParams);

    const update = (event: MessageEvent) => {
      if (
        !event?.data ||
        !event.data.type ||
        event.data.type !== "replicad-command"
      ) {
        return;
      }

      if (event.data.command === "update") {
        const newParams = { ...(defaultParams || {}), ...event.data.params };
        updateParams(newParams);
        return;
      }

      if (event.data.command === "download") {
        saveShape("defaultShape", event.data.params.format || "stl", code!);
      }

      if (event.data.command === "load-font") {
        const { font, fontName, forceUpdate } = event.data.params;
        loadFont(font, fontName, forceUpdate);
        return;
      }

      if (event.data.command === "load-code") {
        const newCode = event.data.params.code;
        setCode(newCode);
      }

      console.warn("Unknown command received:", event?.data?.command);
    };

    window.addEventListener("message", update);
    window.parent.postMessage("replicad-ready", "*");
    return () => {
      window.removeEventListener("message", update);
    };
  }, [updateParams, defaultParams]);

  if (error)
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-full p-4 bg-background">
        <h4>Error</h4>
        {error.type === "url" && (
          <>
            <p>
              We could not find a shape to render <a href={downloadURL as string}>here</a>
              .
            </p>
            <p>
              Are you sure that the link is pointing to a raw javascript file?
            </p>
          </>
        )}
        {error.type === "code" && (
          <>
            <p>
              <code>#code</code> parameter is missing or could not be rendered.
            </p>
          </>
        )}
      </div>
    );

  return (
    <>
      <StandardUI
        isLoading={isLoading}
        computedShapes={computedShapes}
        computedLabels={labels}
        defaultParams={defaultParams}
        updateParams={updateParams}
        disableAutoPosition={checkParam("disable-auto-position")}
        hideGrid={checkParam("hide-grid")}
        orthographicCamera={checkParam("ortho-camera")}
        disableDamping={checkParam("disable-damping")}
        showParams={checkParam("params")}
        disableMenus={checkParam("enable-post-message-mode")}
        onSave={(format: string) => saveShape("defaultShape", format, code!)}
        canSave={geometryHasBeenComputed}
      />
      <div className="absolute text-xs bottom-6 left-1/2 -translate-x-1/2 [&>a]:no-underline">
        <a href="https://replicad.xyz" target="_blank">
          {" replicad "}
        </a>
        |
        <a href={workbenchUrl} target="_blank">
          {" edit "}
        </a>
        |
        <a href={downloadURL as string} target="_blank">
          {" source "}
        </a>
      </div>
    </>
  );
}

export function MakeLink() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full p-4 bg-background">
      <div className="flex relative flex-col w-full max-w-[600px]">
        <h4>Create a link to a replicad file</h4>
        <LinkEditor />
      </div>
    </div>
  );
}
