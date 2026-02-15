import { expose } from "comlink";
import * as replicad from "replicad";

import initOpenCascade from "./initOCSingle";
import initOpenCascadeWithExceptions from "./initOCWithExceptions";
import { StudioHelper } from "./utils/StudioHelper";

import { renderOutput, ShapeStandardizer } from "./utils/renderOutput";
import { parseStlBinary, validateMesh, computeBoundingBox } from "./openscad/stl-parser";
import { compileScadToStl } from "./openscad/wasm-compiler";
import {
  createDiagnosticsReport,
  formatDiagnosticsForConsole,
  formatDiagnosticsForUI,
} from "./openscad/diagnostics";
import type { GenerateScadResult, DiagnosticsReport } from "./openscad/types";

(self as any).replicad = replicad;

// Production: static glob for bundling. Dev: unused (uses @vite-ignore dynamic imports).
const modelModules = import.meta.glob<{ main: (params: any) => any; defaultParams: any }>(
  "./models/*/model.ts"
);

const moduleCache: Record<string, any> = {};
let reloadTimestamps: Record<string, number> = {};

async function loadModel(slug: string) {
  if (moduleCache[slug]) return moduleCache[slug];

  let mod;
  if (import.meta.env.DEV) {
    const t = reloadTimestamps[slug] || 0;
    const query = t ? `?t=${t}` : "";
    mod = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}src/models/${slug}/model.ts${query}`);
  } else {
    const path = `./models/${slug}/model.ts`;
    if (!(path in modelModules)) throw new Error(`Model "${slug}" not found`);
    mod = await modelModules[path]();
  }

  moduleCache[slug] = mod;
  return mod;
}

async function reloadModel(slug: string) {
  delete moduleCache[slug];
  reloadTimestamps[slug] = Date.now();
}

const getDefaultParams = async (slug: string) => {
  const mod = await loadModel(slug);
  return mod.defaultParams || null;
};

const SHAPES_MEMORY: Record<string, any> = {};

const ocVersions: Record<string, any> = {
  withExceptions: null,
  single: null,
  current: null,
};

let OC: Promise<any> = Promise.reject("OpenCascade not initialized");

function enableExceptions() {
  if (!ocVersions.withExceptions) {
    ocVersions.withExceptions = initOpenCascadeWithExceptions();
  }
  ocVersions.current = "withExceptions";
  OC = ocVersions.withExceptions;
}

function disableExceptions() {
  if (!ocVersions.single) {
    ocVersions.single = initOpenCascade();
  }
  ocVersions.current = "single";
  OC = ocVersions.single;
}

async function toggleExceptions() {
  if (ocVersions.current === "single") {
    enableExceptions();
  } else {
    disableExceptions();
  }

  await OC;
  return ocVersions.current;
}

disableExceptions();

const formatException = (oc: any, e: any) => {
  let message = "error";

  if (typeof e === "number") {
    if (oc.OCJS) {
      const error = oc.OCJS.getStandard_FailureData(e);
      message = error.GetMessageString();
    } else {
      message = `Kernel error ${e}`;
    }
  } else {
    message = e.message;
    console.error(e);
  }

  return {
    error: true,
    message,
    stack: e.stack,
  };
};

// Store the latest diagnostics report for the UI
let lastDiagnosticsReport: DiagnosticsReport | null = null;

/**
 * Build shapes from an OpenSCAD model:
 * generateScad() → SCAD source → WASM compile → STL → parsed mesh
 */
const buildShapesFromOpenScad = async (slug: string, mod: any, params: any) => {
  let result: GenerateScadResult;
  try {
    result = mod.generateScad(params);
  } catch (e: any) {
    const message = e?.message || String(e);
    console.error(`[OpenSCAD] Generator error for "${slug}":`, e);
    return {
      error: true,
      message: `SCAD generator error: ${message}`,
      stack: e?.stack,
    };
  }

  const { scad, manifest, sourceMap } = result;
  console.log(`[OpenSCAD] Generated SCAD for "${slug}" (${scad.length} chars)`);

  // Compile SCAD → STL via WASM
  const compileResult = await compileScadToStl(scad);

  if (!compileResult.ok) {
    const report = createDiagnosticsReport(
      slug,
      compileResult.error,
      scad,
      false,
      sourceMap
    );
    lastDiagnosticsReport = report;

    // Log diagnostics to console
    console.error(formatDiagnosticsForConsole(report));

    const uiInfo = formatDiagnosticsForUI(report);
    return {
      error: true,
      message: uiInfo.summary,
      diagnostics: uiInfo.details,
      scadSource: scad,
      stack: typeof compileResult.raw === 'object' && compileResult.raw !== null && 'stack' in (compileResult.raw as any)
        ? (compileResult.raw as any).stack
        : undefined,
    };
  }

  // Parse the STL binary into mesh data
  let mesh;
  try {
    mesh = parseStlBinary(compileResult.stl.buffer);
  } catch (e: any) {
    console.error(`[OpenSCAD] STL parse error for "${slug}":`, e);
    return {
      error: true,
      message: `Failed to parse compiled STL: ${e.message}`,
      stack: e.stack,
    };
  }

  // Validate the mesh
  const issues = validateMesh(mesh);
  if (issues.length > 0) {
    console.warn(`[OpenSCAD] Mesh validation warnings for "${slug}":`, issues);
  }

  const bbox = computeBoundingBox(mesh);
  console.log(
    `[OpenSCAD] Compiled "${slug}": ${mesh.triangleCount} triangles, ` +
    `bbox [${bbox.min.map((n: number) => n.toFixed(1)).join(",")}] → [${bbox.max.map((n: number) => n.toFixed(1)).join(",")}]`
  );

  // Create a success diagnostics report
  const report = createDiagnosticsReport(slug, "", scad, true, sourceMap);
  lastDiagnosticsReport = report;

  // Store STL data for export
  SHAPES_MEMORY.defaultShape = [{ stlData: compileResult.stl, name: slug }];

  // Return mesh in STL format that the viewer can render
  return [
    {
      name: manifest?.model || slug,
      format: "stl",
      vertices: mesh.vertices,
      normals: mesh.normals,
      triangleCount: mesh.triangleCount,
      color: undefined,
      opacity: undefined,
      labels: [],
      error: false,
    },
  ];
};

/**
 * Build shapes from a replicad model (existing pipeline).
 */
const buildShapesFromReplicad = async (slug: string, mod: any, params: any) => {
  const oc = await OC;
  (replicad as any).setOC(oc);
  if (!(replicad as any).getFont())
    await (replicad as any).loadFont(`${import.meta.env.BASE_URL}fonts/HKGrotesk-Regular.ttf`);

  let shapes;
  const helper = new StudioHelper();
  const standardizer = new ShapeStandardizer();

  try {
    (self as any).$ = helper;
    (self as any).registerShapeStandardizer =
      standardizer.registerAdapter.bind(standardizer);

    const effectiveParams = params || mod.defaultParams || {};
    shapes = await mod.main(effectiveParams);
  } catch (e) {
    return formatException(await OC, e);
  }

  return renderOutput(
    shapes,
    standardizer,
    (shapes: any[]) => {
      const editedShapes = helper.apply(shapes);
      SHAPES_MEMORY.defaultShape = shapes;
      return editedShapes;
    }
  );
};

const buildShapesFromModel = async (slug: string, params?: any) => {
  const mod = await loadModel(slug);
  const effectiveParams = params || mod.defaultParams || {};

  // Detect model type: OpenSCAD models export generateScad()
  if (typeof mod.generateScad === "function") {
    return buildShapesFromOpenScad(slug, mod, effectiveParams);
  }

  // Default: replicad pipeline
  return buildShapesFromReplicad(slug, mod, effectiveParams);
};

const buildBlob = (
  shape: any,
  fileType: string,
  meshConfig = {
    tolerance: 0.01,
    angularTolerance: 30,
  }
) => {
  if (fileType === "stl") return shape.blobSTL(meshConfig);
  if (fileType === "stl-binary")
    return shape.blobSTL({ ...meshConfig, binary: true });
  if (fileType === "step") return shape.blobSTEP();
  throw new Error(`Filetype "${fileType}" unknown for export.`);
};

const exportShape = async (
  fileType = "stl",
  shapeId = "defaultShape",
  meshConfig?: any
) => {
  if (!SHAPES_MEMORY[shapeId])
    throw new Error(`Shape ${shapeId} not computed yet`);
  if (fileType === "step-assembly") {
    return [
      {
        blob: (replicad as any).exportSTEP(SHAPES_MEMORY[shapeId]),
        name: shapeId,
      },
    ];
  }
  return SHAPES_MEMORY[shapeId].map(({ shape, name }: any) => ({
    blob: buildBlob(shape, fileType, meshConfig),
    name,
  }));
};

const loadFont = async (fontData: any, fontName: string, forceUpdate = false) => {
  const oc = await OC;
  (replicad as any).setOC(oc);
  await (replicad as any).loadFont(fontData, fontName, forceUpdate);
};

const faceInfo = (subshapeIndex: number, faceIndex: number, shapeId = "defaultShape") => {
  const face = SHAPES_MEMORY[shapeId]?.[subshapeIndex]?.shape.faces[faceIndex];
  if (!face) return null;
  return {
    type: face.geomType,
    center: face.center.toTuple(),
    normal: face.normalAt().normalize().toTuple(),
  };
};

const edgeInfo = (subshapeIndex: number, edgeIndex: number, shapeId = "defaultShape") => {
  const edge = SHAPES_MEMORY[shapeId]?.[subshapeIndex]?.shape.edges[edgeIndex];
  if (!edge) return null;
  return {
    type: edge.geomType,
    start: edge.startPoint.toTuple(),
    end: edge.endPoint.toTuple(),
    direction: edge.tangentAt().normalize().toTuple(),
  };
};

const getOpenScadDiagnostics = () => {
  if (!lastDiagnosticsReport) return null;
  return formatDiagnosticsForUI(lastDiagnosticsReport);
};

const service = {
  ready: () => OC.then(() => true),
  buildShapesFromModel,
  getDefaultParams,
  reloadModel,
  loadFont,
  exportShape,
  edgeInfo,
  faceInfo,
  toggleExceptions,
  exceptionsEnabled: () => ocVersions.current === "withExceptions",
  getOpenScadDiagnostics,
};

expose(service, self);
export default service;
