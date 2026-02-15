/**
 * OpenSCAD WASM compiler wrapper.
 *
 * Wraps the official OpenSCAD WASM build to compile .scad source strings
 * into STL binary blobs. Runs inside a Web Worker to avoid blocking the
 * main thread.
 *
 * The WASM module is loaded lazily on first compile and cached thereafter.
 */

import type { CompileResult } from "./types";

// The OpenSCAD WASM module instance, lazily initialized
let openscadInstance: OpenScadWasmInstance | null = null;
let initPromise: Promise<OpenScadWasmInstance> | null = null;

/** Minimal interface that the OpenSCAD WASM module must expose */
interface OpenScadWasmInstance {
  callMain(args: string[]): number;
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, opts?: { encoding?: string }): Uint8Array | string;
    unlink(path: string): void;
    stat(path: string): { size: number };
  };
}

/** Options for loading the OpenSCAD WASM module */
export interface WasmLoaderOptions {
  /** URL to the OpenSCAD WASM JS loader (e.g. "/openscad.js") */
  wasmJsUrl?: string;
  /** URL to the WASM binary (e.g. "/openscad.wasm") */
  wasmBinaryUrl?: string;
  /** Custom factory function that returns an initialized WASM instance */
  factory?: () => Promise<OpenScadWasmInstance>;
}

let loaderOptions: WasmLoaderOptions = {};

/**
 * Configure how the OpenSCAD WASM module is loaded.
 * Must be called before the first compile, or the default loader will be used.
 */
export function configureWasmLoader(opts: WasmLoaderOptions): void {
  loaderOptions = opts;
  // Reset cached instance so next compile uses new config
  openscadInstance = null;
  initPromise = null;
}

/**
 * Load and initialize the OpenSCAD WASM module.
 * Returns the cached instance on subsequent calls.
 */
async function getOpenScadInstance(): Promise<OpenScadWasmInstance> {
  if (openscadInstance) return openscadInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (loaderOptions.factory) {
      openscadInstance = await loaderOptions.factory();
    } else {
      // Attempt to load from a global or dynamic import
      // This supports both bundled and CDN-loaded OpenSCAD WASM
      const globalRef = (self as any).__openscad_wasm_factory;
      if (typeof globalRef === "function") {
        openscadInstance = await globalRef({
          wasmBinaryUrl: loaderOptions.wasmBinaryUrl,
        });
      } else {
        throw new Error(
          "OpenSCAD WASM not available. Call configureWasmLoader() with a " +
            "factory function, or set self.__openscad_wasm_factory before compiling."
        );
      }
    }
    return openscadInstance!;
  })();

  return initPromise;
}

/**
 * Compile an OpenSCAD source string to an STL binary.
 *
 * @param scadSource - The .scad file contents
 * @param options    - Compile options (timeout, output format)
 * @returns CompileResult with either the STL data or an error
 */
export async function compileScadToStl(
  scadSource: string,
  options: { timeoutMs?: number } = {}
): Promise<CompileResult> {
  const { timeoutMs = 30_000 } = options;

  const inputPath = "/tmp/input.scad";
  const outputPath = "/tmp/output.stl";

  let instance: OpenScadWasmInstance;
  try {
    instance = await getOpenScadInstance();
  } catch (e) {
    return {
      ok: false,
      error: `Failed to load OpenSCAD WASM: ${e instanceof Error ? e.message : String(e)}`,
      raw: e,
    };
  }

  // Write source to virtual filesystem
  try {
    instance.FS.writeFile(inputPath, scadSource);
  } catch (e) {
    return {
      ok: false,
      error: `Failed to write SCAD source to WASM FS: ${e instanceof Error ? e.message : String(e)}`,
      raw: e,
    };
  }

  // Run OpenSCAD with a timeout guard
  const compilePromise = new Promise<CompileResult>((resolve) => {
    try {
      const exitCode = instance.callMain([
        "-o",
        outputPath,
        inputPath,
      ]);

      if (exitCode !== 0) {
        resolve({
          ok: false,
          error: `OpenSCAD exited with code ${exitCode}`,
          raw: { exitCode },
        });
        return;
      }

      // Read the output STL
      try {
        const stlData = instance.FS.readFile(outputPath) as Uint8Array;
        if (stlData.byteLength === 0) {
          resolve({
            ok: false,
            error: "OpenSCAD produced an empty STL file",
          });
          return;
        }
        resolve({ ok: true, stl: new Uint8Array(stlData) });
      } catch (readErr) {
        resolve({
          ok: false,
          error: `Failed to read compiled STL: ${readErr instanceof Error ? readErr.message : String(readErr)}`,
          raw: readErr,
        });
      }
    } catch (e) {
      resolve({
        ok: false,
        error: `OpenSCAD compilation failed: ${e instanceof Error ? e.message : String(e)}`,
        raw: e,
      });
    } finally {
      // Cleanup virtual filesystem
      try {
        instance.FS.unlink(inputPath);
      } catch { /* ignore */ }
      try {
        instance.FS.unlink(outputPath);
      } catch { /* ignore */ }
    }
  });

  // Apply timeout
  const timeoutPromise = new Promise<CompileResult>((resolve) => {
    setTimeout(() => {
      resolve({
        ok: false,
        error: `OpenSCAD compilation timed out after ${timeoutMs}ms`,
      });
    }, timeoutMs);
  });

  return Promise.race([compilePromise, timeoutPromise]);
}

/**
 * Check whether OpenSCAD WASM is available and initialized.
 */
export function isWasmAvailable(): boolean {
  return openscadInstance !== null;
}

/**
 * Preload the OpenSCAD WASM module without running a compilation.
 */
export async function preloadWasm(): Promise<boolean> {
  try {
    await getOpenScadInstance();
    return true;
  } catch {
    return false;
  }
}
