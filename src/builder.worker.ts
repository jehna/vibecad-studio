import { expose } from "comlink";
import * as replicad from "replicad";

import initOpenCascade from "./initOCSingle";
import initOpenCascadeWithExceptions from "./initOCWithExceptions";
import { StudioHelper } from "./utils/StudioHelper";
import { runInContext, buildModuleEvaluator } from "./vm";

import { renderOutput, ShapeStandardizer } from "./utils/renderOutput";

(self as any).replicad = replicad;

export function runInContextAsOC(code: string, context: Record<string, any> = {}) {
  const editedText = `
${code}
let dp = {}
try {
  dp = defaultParams;
} catch (e) {}
return main(replicad, __inputParams || dp)
  `;

  return runInContext(editedText, context);
}

async function runAsFunction(code: string, params?: any) {
  const oc = await OC;

  return runInContextAsOC(code, {
    oc,
    replicad,
    __inputParams: params,
  });
}

export async function runAsModule(code: string, params?: any) {
  const module = await buildModuleEvaluator(code);

  if (module.default) return module.default(params || module.defaultParams);
  return module.main(replicad, params || module.defaultParams || {});
}

const runCode = async (code: string, params?: any) => {
  if (code.match(/^\s*export\s+/m)) {
    return runAsModule(code, params);
  }
  return runAsFunction(code, params);
};

const extractDefaultParamsFromCode = async (code: string) => {
  if (code.match(/^\s*export\s+/m)) {
    const module = await buildModuleEvaluator(code);
    return module.defaultParams || null;
  }

  const editedText = `
${code}
try {
  return defaultParams;
} catch (e) {
  return null;
}
  `;

  try {
    return runInContext(editedText, {});
  } catch (e) {
    return {};
  }
};

const extractDefaultNameFromCode = async (code: string) => {
  if (code.match(/^\s*export\s+/m)) {
    const module = await buildModuleEvaluator(code);
    return module.defaultName;
  }

  const editedText = `
${code}
try {
  return defaultName;
} catch (e) {
  return;
}
  `;

  try {
    return runInContext(editedText, {});
  } catch (e) {
    return;
  }
};

const computeLabels = async (code: string, params?: any) => {
  if (!code.match(/^\s*export\s+/m)) return [];
  const module = await buildModuleEvaluator(code);

  const oc = await OC;
  (replicad as any).setOC(oc);
  if (!(replicad as any).getFont())
    await (replicad as any).loadFont("/fonts/HKGrotesk-Regular.ttf");

  const labels = module.labels?.(params || module.defaultParams || {}) || [];

  return labels.filter((labelConfig: any) => {
    return (
      labelConfig && labelConfig.label && labelConfig.from && labelConfig.to
    );
  });
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

const buildShapesFromCode = async (code: string, params?: any) => {
  const oc = await OC;
  (replicad as any).setOC(oc);
  if (!(replicad as any).getFont())
    await (replicad as any).loadFont("/fonts/HKGrotesk-Regular.ttf");

  let shapes;
  const helper = new StudioHelper();
  const standardizer = new ShapeStandardizer();

  try {
    (self as any).$ = helper;
    (self as any).registerShapeStandardizer =
      standardizer.registerAdapter.bind(standardizer);
    shapes = await runCode(code, params);
  } catch (e) {
    return formatException(oc, e);
  }

  return renderOutput(
    shapes,
    standardizer,
    (shapes: any[]) => {
      const editedShapes = helper.apply(shapes);
      SHAPES_MEMORY.defaultShape = shapes;
      return editedShapes;
    },
    code && (await extractDefaultNameFromCode(code))
  );
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

const service = {
  ready: () => OC.then(() => true),
  buildShapesFromCode,
  loadFont,
  computeLabels,
  extractDefaultParamsFromCode,
  extractDefaultNameFromCode,
  exportShape,
  edgeInfo,
  faceInfo,
  toggleExceptions,
  exceptionsEnabled: () => ocVersions.current === "withExceptions",
};

expose(service, self);
export default service;
