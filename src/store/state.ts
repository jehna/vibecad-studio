import { types, flow, getSnapshot } from "mobx-state-tree";
import { autorun } from "mobx";

import api from "@/utils/builderAPI";
import UIState from "./ui-state";
import CodeState from "./code-state";
import SelectedInfo from "./selected-info";

const inSeries = (func: () => Promise<void>) => {
  let refresh: boolean;
  let currentlyRunning = false;

  return async function () {
    if (currentlyRunning) {
      refresh = true;
      return;
    }
    currentlyRunning = true;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      refresh = false;
      await func();

      if (!refresh) break;
    }

    currentlyRunning = false;
  };
};

const AppState = types
  .model("AppState", {
    ui: UIState,
    code: CodeState,
    selectedInfo: SelectedInfo,
    config: types.optional(
      types.model({
        modelSlug: types.optional(types.string, ""),
      }),
      {}
    ),
  })
  .views((self) => ({
    get currentValues() {
      return getSnapshot(self.config);
    },
    get hasError() {
      return !!(self as any).error?.error;
    },

    get modelInitialized() {
      return !!self.config.modelSlug;
    },
  }))
  .volatile(() => ({
    defaultParams: null as any,
    currentMesh: [] as any[],
    processing: false,
    shapeLoaded: false,
    error: false as any,
    faceInfo: null as any,
    processingInfo: null as any,
    exceptionMode: "single",
    currentLabels: [] as any[],
  }))
  .actions((self) => ({
    initModel(slug: string) {
      self.config.modelSlug = slug;
    },

    toggleExceptions: flow(function* toggleExceptions() {
      self.exceptionMode = yield api.toggleExceptions();
    }),

    process: flow(function* process(params?: any) {
      self.ui.deHighlight();
      self.processing = true;
      try {
        const mesh = yield api.buildShapesFromModel(
          self.currentValues.modelSlug,
          params
        );

        if (mesh.error) {
          console.error("[engine] Build failed:", mesh.message, mesh.stack || "");
          self.error = mesh;
        } else {
          self.currentMesh = mesh;
          self.error = false;
        }

        self.shapeLoaded = true;
      } catch (e) {
        console.error(e);
        self.error = e;
      }

      try {
        self.defaultParams = yield api.getDefaultParams(
          self.currentValues.modelSlug
        );
      } catch (e) {
        console.log("no default params");
      }

      self.processing = false;
    }),
  }))
  .extend((self) => {
    let disposer: (() => void) | null = null;

    const processor = inSeries(self.process as any);

    const run = async () => {
      if (!self.currentValues.modelSlug) return;
      self.exceptionMode;
      await processor();
    };

    return {
      actions: {
        afterCreate() {
          disposer = autorun(run);
        },

        afterDestroy() {
          if (disposer) disposer();
        },
      },
    };
  });

export default AppState;
