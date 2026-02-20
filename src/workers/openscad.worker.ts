import { expose } from "comlink";
import { createOpenSCAD } from "openscad-wasm";

let logs: string[] = [];
let errors: string[] = [];

function isActualError(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("error") ||
    lower.includes("warning") ||
    lower.startsWith("parse error") ||
    lower.startsWith("syntax error")
  );
}

async function createInstance() {
  logs = [];
  errors = [];

  return createOpenSCAD({
    print: (text: string) => {
      logs.push(text);
    },
    printErr: (text: string) => {
      if (isActualError(text)) {
        errors.push(text);
      } else {
        logs.push(text);
      }
    },
  });
}

const api = {
  async ready() {
    // Warm up by creating and discarding one instance
    await createInstance();
  },

  async render(
    scadSource: string,
    params: Record<string, number> = {},
    libs: Record<string, string> = {}
  ): Promise<{ stl: Uint8Array | null; logs: string[]; errors: string[] }> {
    // Fresh instance for each render — callMain corrupts global state
    const inst = await createInstance();
    const openscad = inst.getInstance();

    for (const [filename, source] of Object.entries(libs)) {
      openscad.FS.writeFile(`/${filename}`, source);
    }

    openscad.FS.writeFile("/input.scad", scadSource);

    const args: string[] = ["/input.scad", "-o", "/output.stl"];

    // Higher polygon count for smoother curves (OpenSCAD default is very low)
    if (!("$fn" in params)) {
      args.push("-D", "$fn=64");
    }

    for (const [key, value] of Object.entries(params)) {
      args.push("-D", `${key}=${value}`);
    }

    let exitCode: number;
    try {
      exitCode = openscad.callMain(args);
    } catch (e) {
      errors.push(String(e));
      return { stl: null, logs: [...logs], errors: [...errors] };
    }

    let stl: Uint8Array | null = null;
    if (exitCode === 0) {
      try {
        stl = openscad.FS.readFile("/output.stl", {
          encoding: "binary",
        });
      } catch {
        errors.push("Failed to read output STL file");
      }
    } else {
      if (errors.length === 0) {
        errors.push(`OpenSCAD exited with code ${exitCode}`);
      }
    }

    return { stl, logs: [...logs], errors: [...errors] };
  },
};

expose(api);
