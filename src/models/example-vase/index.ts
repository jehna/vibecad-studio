import type { ModelDefinition } from "../types";
import code from "./model.ts?raw";

const model: ModelDefinition = {
  name: "Example Vase",
  description: "A simple revolve-based vase with smooth spline profile",
  slug: "example-vase",
  code,
};

export default model;
