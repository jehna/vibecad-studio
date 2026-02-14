import type { ModelDefinition } from "../types";
import code from "./model.ts?raw";

const model: ModelDefinition = {
  name: "Plant Light Holder",
  description: "A wall-mounted plant light holder with U-shaped hook",
  slug: "plant-light-holder",
  code,
};

export default model;
