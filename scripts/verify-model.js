#!/usr/bin/env node

/**
 * Verify an OpenSCAD model compiles successfully.
 * Usage: node scripts/verify-model.js src/models/example-box/model.scad [-D name=value]
 */

import { readFileSync } from "fs";
import { createOpenSCAD } from "openscad-wasm";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/verify-model.js <file.scad> [-D name=value ...]");
  process.exit(1);
}

const scadPath = args[0];
const overrides = [];
for (let i = 1; i < args.length; i++) {
  if (args[i] === "-D" && i + 1 < args.length) {
    overrides.push(args[++i]);
  }
}

const source = readFileSync(scadPath, "utf-8");
const logs = [];
const errors = [];

const instance = await createOpenSCAD({
  print: (text) => {
    logs.push(text);
    console.log(text);
  },
  printErr: (text) => {
    errors.push(text);
    console.error(text);
  },
});

const openscad = instance.getInstance();
openscad.FS.writeFile("/input.scad", source);

const cmdArgs = ["/input.scad", "-o", "/output.stl"];
for (const o of overrides) {
  cmdArgs.push("-D", o);
}

const exitCode = openscad.callMain(cmdArgs);

if (exitCode === 0) {
  try {
    const stl = openscad.FS.readFile("/output.stl", { encoding: "binary" });
    console.log(`\nSuccess: generated ${stl.byteLength} bytes of STL`);
  } catch {
    console.error("\nFailed to read output STL");
    process.exit(1);
  }
} else {
  console.error(`\nOpenSCAD exited with code ${exitCode}`);
}

process.exit(exitCode === 0 ? 0 : 1);
