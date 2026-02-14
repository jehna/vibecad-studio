import "replicad-opencascadejs/src/replicad_single.wasm?url";

import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./pages/Home";
import LinkWidget, { MakeLink } from "./LinkWidget";

import ReloadPrompt from "./ReloadPrompt";
import LoadingScreen from "./components/LoadingScreen";

const Workbench = React.lazy(() => import("./workbench/Workbench"));

export default function App() {
  return (
    <>
      <ReloadPrompt />
      <Switch>
        <Route path="/workbench/:modelSlug?">
          <React.Suspense fallback={<LoadingScreen />}>
            <Workbench />
          </React.Suspense>
        </Route>
        <Route exact path="/share">
          <MakeLink />
        </Route>
        <Route path="/share/code">
          <LinkWidget />
        </Route>
        <Route path="/share/url">
          <LinkWidget />
        </Route>
        <Route path="/share/:shapeURL">
          <LinkWidget />
        </Route>

        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </>
  );
}
