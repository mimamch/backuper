import { zipDir } from "./zip";

const main = async () => {
  const filePath = await zipDir("./tmp", "backup.zip");
  console.log(filePath);
};

main();
