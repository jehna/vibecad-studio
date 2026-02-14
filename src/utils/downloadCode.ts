import { fileSave } from "browser-fs-access";
import builderAPI from "./builderAPI";

export default async (code: string, fileName?: string | null) => {
  const resolvedName =
    (await builderAPI.extractDefaultNameFromCode(code)) ||
    fileName ||
    "replicad-script";
  return fileSave(
    new Blob([code], {
      type: "application/javascript",
    }),
    {
      id: "save-js",
      fileName: `${resolvedName}.js`,
      description: "JS replicad script of the current geometry",
      extensions: [".js"],
    }
  );
};
