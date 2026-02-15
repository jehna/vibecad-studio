import { types } from "mobx-state-tree";

const ClipConfig = types.optional(
  types
    .model("ClipConfig", {
      disabled: types.optional(types.boolean, true),
      plane: types.optional(types.string, "XZ"),
      constant: types.optional(types.number, 0),
    })
    .views((self) => ({
      get position() {
        if (self.plane === "XY") return self.constant;
        else return -self.constant;
      },
      get planeVector() {
        if (self.disabled) return undefined;
        return {
          XZ: [0, 1, 0],
          XY: [0, 0, -1],
          YZ: [1, 0, 0],
        }[self.plane];
      },
    }))
    .actions((self) => ({
      toggle() {
        self.disabled = !self.disabled;
      },
      setPlane(newPlane: string) {
        self.plane = newPlane;
        self.constant = 0;
      },
      setConstant(newConstant: number) {
        self.constant = newConstant;
      },
    })),
  {}
);

export default types.optional(
  types
    .model("UIState", {
      clip: ClipConfig,
      showDownload: types.optional(types.boolean, false),
      enableParams: types.optional(types.boolean, false),
    })
    .actions((self) => {
      return {
        changeDownload(newValue: boolean) {
          self.showDownload = newValue;
        },
        changeEnableParams(newValue: boolean) {
          self.enableParams = newValue;
        },
      };
    }),
  {}
);
