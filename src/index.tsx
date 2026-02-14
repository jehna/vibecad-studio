import React from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";

import App from "./App";
import "./index.css";

import "replicad-opencascadejs/src/replicad_single.wasm?url";
import "replicad-opencascadejs/src/replicad_with_exceptions.wasm?url";

import { BrowserRouter } from "react-router-dom";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const root = createRoot(document.getElementById("root")!);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
