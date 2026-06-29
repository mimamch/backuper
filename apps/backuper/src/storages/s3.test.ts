import { createS3Storage } from "./s3";

const main = async () => {
  const storage = createS3Storage();
  const response = await storage.store("./tmp/hello.json", "hello.json");
  console.log(response);
};

main();
