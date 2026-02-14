import "replicad-opencascadejs/src/replicad_single.wasm?url";

import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import LinkWidget, { MakeLink } from "./LinkWidget";

import ReloadPrompt from "./ReloadPrompt";
import LoadingScreen from "./components/LoadingScreen";

const Workbench = React.lazy(() => import("./workbench/Workbench"));

export default function App() {
  return (
    <>
      <ReloadPrompt />
      <Routes>
        <Route path="/workbench/:modelSlug?" element={
          <React.Suspense fallback={<LoadingScreen />}>
            <Workbench />
          </React.Suspense>
        } />
        <Route path="/share" element={<MakeLink />} />
        <Route path="/share/code" element={<LinkWidget />} />
        <Route path="/share/url" element={<LinkWidget />} />
        <Route path="/share/:shapeURL" element={<LinkWidget />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
