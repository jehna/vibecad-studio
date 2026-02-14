import { observable } from "mobx";
import { types, getRoot, flow } from "mobx-state-tree";
import codeInit, { exportCode } from "./codeInit";

const REFRESH_RATE = 1000;

export default types.optional(
  types
    .model("CodeState", {})
    .views((self) => ({
      get current() {
        return (getRoot(self) as any).config.code;
      },
      get initialized() {
        return !!self.current;
      },
    }))
    .actions((self) => ({
      update(newCode: string, save = false) {
        (getRoot(self) as any).updateCode(newCode || " ");

        if (save) {
          localStorage.setItem("script", newCode);
        }
      },
      init: flow(function* () {
        const code = yield codeInit();
        self.update(code);
      }),

      export: flow(function* () {
        const code = yield exportCode(self.current);
        return code;
      }),
    }))

    .extend((self) => {
      const reader = new FileReader();
      reader.onabort = (e) => {
        console.log("file reading was aborted", e);
        self.stopListening();
      };
      reader.onerror = (e) => {
        console.log("file reading has failed", e);
        self.stopListening();
      };
      reader.onload = () => {
        self.update(reader.result as string);
      };

      const interval = observable.box<ReturnType<typeof setInterval> | null>(null);
      const fileHandle = observable.box<any>(null);

      const read = async () => {
        if (!fileHandle.get()) return;
        const file = await fileHandle.get().getFile();
        reader.readAsText(file);
      };

      return {
        views: {
          get listeningFileOnDisk() {
            return !!fileHandle.get();
          },
        },
        actions: {
          startListening(newFileHandle: any) {
            if (self.listeningFileOnDisk) {
              self.stopListening();
            }
            if (!newFileHandle) return;
            fileHandle.set(newFileHandle);
            interval.set(setInterval(read, REFRESH_RATE));
          },
          stopListening() {
            clearInterval(interval.get()!);
            interval.set(null);
            fileHandle.set(null);
          },
        },
      };
    }),
  {}
);
