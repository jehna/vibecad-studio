import { types, getRoot } from "mobx-state-tree";

export default types.optional(
  types
    .model("CodeState", {})
    .views((self) => ({
      get currentSlug() {
        return (getRoot(self) as any).config.modelSlug;
      },
      get initialized() {
        return !!self.currentSlug;
      },
      get listeningFileOnDisk() {
        return false;
      },
    })),
  {}
);
