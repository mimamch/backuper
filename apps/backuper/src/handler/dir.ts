import fs from "fs";
import { BackupHandlerProps, DatabaseHandler } from ".";
import { zipDir } from "../archiver/zip";

export const dirHandler = (): DatabaseHandler => {
  return {
    test: async (props: BackupHandlerProps) => {
      if (!props.dir) {
        throw new Error("Directory path is required for dir backup");
      }
      return fs.promises
        .access(props.dir.path)
        .then(() => true)
        .catch(() => false);
    },
    backup: async (props: BackupHandlerProps) => {
      if (!props.dir) {
        throw new Error("Directory path is required for dir backup");
      }

      const zipPath = await zipDir(
        props.dir.path,
        `${new Date().toISOString()}.zip`,
      );

      return {
        path: zipPath,
      };
    },
  };
};
