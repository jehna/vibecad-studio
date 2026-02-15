import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
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
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
