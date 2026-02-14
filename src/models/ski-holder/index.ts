import type { ModelDefinition } from "../types";
import code from "./model.ts?raw";

const model: ModelDefinition = {
  name: "Ski Holder",
  description: "A wall-mounted ski and pole holder with swept profile",
  slug: "ski-holder",
  code,
};

export default model;
