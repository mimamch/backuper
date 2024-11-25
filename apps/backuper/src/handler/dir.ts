import { DatabaseHandler } from ".";
import { zipDir } from "../archiver/zip";

export const dirHandler = (): DatabaseHandler => {
  return {
    backup: async (props: { dirPath: string }) => {
      const zipPath = await zipDir(
        props.dirPath,
        `${new Date().toISOString()}.zip`
      );

      return {
        path: zipPath,
      };
    },
  };
};
