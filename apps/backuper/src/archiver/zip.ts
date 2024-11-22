import archiver from "archiver";
import fs from "fs";

export const zipDir = async (path: string, name: string): Promise<string> => {
  const isExist = fs.existsSync(path);
  if (!isExist) {
    throw new Error(`Directory ${path} not found`);
  }

  const archive = archiver("zip", {});
  const output = fs.createWriteStream(`tmp/${name}`);

  return new Promise(async (resolve, reject) => {
    archive.on("error", function (err) {
      reject(err);
    });

    output.on("close", function () {
      resolve(`tmp/${name}`);
    });

    archive.pipe(output);

    archive.directory(path, false);

    archive.finalize();
  });
};
