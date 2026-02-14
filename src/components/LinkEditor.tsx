import { useState, useEffect } from "react";

import { dumpCode } from "../utils/dumpCode";
import { Button } from "./Button";

export function LinkEditor({ fromCode }: { fromCode?: string }) {
  const [inputVal, setInputVal] = useState("");
  const [disableAutoPosition, setDisableAutoPosition] = useState(true);
  const [disableDamping, setDisableDamping] = useState(false);
  const [hideGrid, setHideGrid] = useState(false);
  const [orthographicCamera, setOrthographicCamera] = useState(true);
  const [expandParametersPanel, setExpandParametersPanel] = useState(true);

  const [compressedCode, setCompressedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!fromCode) return;
    dumpCode(fromCode).then((code: string) => {
      setCompressedCode(code);
    });
  }, [fromCode]);

  let link: string | null = null;
  let workbenchLink: string | null = null;

  if (inputVal || compressedCode) {
    const url = new URL(window.location.href);
    if (inputVal) {
      url.pathname = "/share/url/";

      const hashParams = new URLSearchParams();
      hashParams.set("url", encodeURIComponent(inputVal));
      url.hash = hashParams.toString();
    }
    if (compressedCode) {
      url.pathname = "/share/code/";
      const hashParams = new URLSearchParams();
      hashParams.set("code", compressedCode);
      url.hash = hashParams.toString();

      const workbenchURL = new URL(window.location.href);
      workbenchURL.pathname = "/workbench";
      workbenchURL.hash = url.hash;
      workbenchLink = workbenchURL.toString();
    }

    disableAutoPosition &&
      url.searchParams.set("disable-auto-position", "true");
    disableDamping && url.searchParams.set("disable-damping", "true");
    hideGrid && url.searchParams.set("hide-grid", "true");
    orthographicCamera && url.searchParams.set("ortho-camera", "true");
    expandParametersPanel && url.searchParams.set("params", "true");
    link = url.toString();
  }

  return (
    <>
      {!fromCode && (
        <div>
          <label htmlFor="url-input">
            Enter the link to a <strong>raw</strong> javascript file.
          </label>
          <input
            id="url-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full max-w-[800px]"
          />
        </div>
      )}

      {workbenchLink && (
        <>
          <h4 className="mb-2 mt-8 first:mt-0">Link to the workbench</h4>
          <div className="flex items-center [&>:not(:last-child)]:mr-4 max-w-full">
            <a
              href={link!}
              target="_blank"
              className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[400px]"
            >
              {workbenchLink}
            </a>
            <Button
              onClick={() => navigator.clipboard.writeText(workbenchLink!)}
              solid
              small
            >
              Copy
            </Button>
          </div>
          <hr className="my-12 h-px border-0 border-b border-primary-light" />
        </>
      )}

      <h4 className="mb-2 mt-8 first:mt-0">Share widget options</h4>
      <div className="flex flex-wrap gap-8 row-gap-2 [&_label]:ml-1">
        <span>
          <input
            id="disable-auto-position"
            type="checkbox"
            checked={!disableAutoPosition}
            onChange={(e) => setDisableAutoPosition(!e.target.checked)}
          />
          <label htmlFor="disable-auto-position">Auto position</label>
        </span>
        <span>
          <input
            id="disable-damping"
            type="checkbox"
            checked={!disableDamping}
            onChange={(e) => setDisableDamping(!e.target.checked)}
          />
          <label htmlFor="disable-damping">Damping</label>
        </span>
        <span>
          <input
            id="hide-grid"
            type="checkbox"
            checked={!hideGrid}
            onChange={(e) => setHideGrid(!e.target.checked)}
          />
          <label htmlFor="hide-grid">Grid</label>
        </span>
        <span>
          <input
            id="ortho-camera"
            type="checkbox"
            checked={!orthographicCamera}
            onChange={(e) => setOrthographicCamera(!e.target.checked)}
          />
          <label htmlFor="ortho-camera">Perspective Camera</label>
        </span>
        <span>
          <input
            id="expand-params"
            type="checkbox"
            checked={expandParametersPanel}
            onChange={(e) => setExpandParametersPanel(e.target.checked)}
          />
          <label htmlFor="expand-params">Parameters panel open</label>
        </span>
      </div>

      <h4 className="mb-2 mt-8 first:mt-0">Link to the share widget</h4>
      {link && (
        <div className="flex items-center [&>:not(:last-child)]:mr-4 max-w-full">
          <a
            href={link}
            target="_blank"
            className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[400px]"
          >
            {link}
          </a>
          <Button
            small
            onClick={() => navigator.clipboard.writeText(link!)}
            solid
          >
            Copy
          </Button>
        </div>
      )}
    </>
  );
}
