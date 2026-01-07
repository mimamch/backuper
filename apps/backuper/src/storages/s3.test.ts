import { readFileSync } from "fs";
import { createS3Storage } from "./s3";

const main = async () => {
  const storage = createS3Storage();
  const buffer = readFileSync("./tmp/hello.json");
  const file = new File([buffer as unknown as Blob], "hello.json", {
    type: "application/json",
  });
  const response = await storage.store(file);
  console.log(response);
};

main();
