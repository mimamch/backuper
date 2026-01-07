import { BackupHandlerProps, DatabaseHandler } from ".";
import { zipDir } from "../archiver/zip";

export const dirHandler = (): DatabaseHandler => {
  return {
    backup: async (props: BackupHandlerProps) => {
      if (!props.dir) {
        throw new Error("Directory path is required for dir backup");
      }

      const zipPath = await zipDir(
        props.dir.path,
        `${new Date().toISOString()}.zip`
      );

      return {
        path: zipPath,
      };
    },
  };
};
