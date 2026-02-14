import React from "react";

import { Button } from "./components/Button";

import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      r &&
        setInterval(() => {
          r.update();
        }, 24 * 3600000);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed right-0 top-0 mt-16 p-3 border border-primary border-r-0 rounded-l z-1 text-left shadow-md bg-card space-y-2">
      <div>
        <span>The site has been updated, click reload to refresh.</span>
      </div>
      <div className="flex justify-end gap-4">
        {needRefresh && (
          <Button
            solid
            onClick={() => {
              updateServiceWorker(true);
            }}
          >
            Reload
          </Button>
        )}
        <Button onClick={() => close()}>Close</Button>
      </div>
    </div>
  );
}

export default ReloadPrompt;
