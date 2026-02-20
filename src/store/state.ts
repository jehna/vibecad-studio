import { types, flow, getSnapshot } from "mobx-state-tree";
import { autorun } from "mobx";

import api from "@/utils/openscadAPI";
import { getModelSource, getLibs } from "@/models";
import { parseScad } from "@/utils/scadParser";
import UIState from "./ui-state";
import CodeState from "./code-state";

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
      return (self as any).errors.length > 0;
    },
    get modelInitialized() {
      return !!self.config.modelSlug;
    },
  }))
  .volatile(() => ({
    defaultParams: null as any,
    currentMesh: null as { stl: Uint8Array } | null,
    processing: false,
    shapeLoaded: false,
    logs: [] as string[],
    errors: [] as string[],
    scadSource: "",
  }))
  .actions((self) => ({
    initModel(slug: string) {
      self.config.modelSlug = slug;
      const source = getModelSource(slug);
      if (source) {
        self.scadSource = source;
        const parsed = parseScad(source);
        const levaParams: Record<string, any> = {};
        for (const p of parsed.params) {
          levaParams[p.name] = {
            value: p.value,
            min: p.min,
            max: p.max,
            step: p.step,
          };
        }
        self.defaultParams = Object.keys(levaParams).length > 0 ? levaParams : null;
      }
    },

    updateSource(source: string) {
      self.scadSource = source;
      const parsed = parseScad(source);
      const levaParams: Record<string, any> = {};
      for (const p of parsed.params) {
        levaParams[p.name] = {
          value: p.value,
          min: p.min,
          max: p.max,
          step: p.step,
        };
      }
      self.defaultParams = Object.keys(levaParams).length > 0 ? levaParams : null;
    },

    process: flow(function* process(params?: Record<string, number>) {
      if (!self.scadSource) return;
      self.processing = true;

      try {
        const result = yield api.render(self.scadSource, params || {}, getLibs());

        self.logs = result.logs;
        self.errors = result.errors;

        if (result.stl) {
          self.currentMesh = { stl: result.stl };
        } else {
          self.currentMesh = null;
        }

        self.shapeLoaded = true;
      } catch (e) {
        console.error(e);
        self.errors = [String(e)];
      }

      self.processing = false;
    }),
  }))
  .extend((self) => {
    let disposer: (() => void) | null = null;

    const processor = inSeries(self.process as any);

    const run = async () => {
      if (!self.currentValues.modelSlug) return;
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
