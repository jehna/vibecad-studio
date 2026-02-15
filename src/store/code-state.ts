import { types, getRoot } from "mobx-state-tree";

export default types.optional(
  types
    .model("CodeState", {})
    .views(() => ({
      get initialized() {
        return false;
      },
    })),
  {}
);
