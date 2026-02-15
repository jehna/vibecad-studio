import { fileSave } from "browser-fs-access";

export default async function saveStl(stl: Uint8Array, name = "model") {
  await fileSave(
    new Blob([stl as any], { type: "application/octet-stream" }),
    {
      id: "exports",
      fileName: `${name}.stl`,
      description: "Save STL file",
      extensions: [".stl"],
    }
  );
}
