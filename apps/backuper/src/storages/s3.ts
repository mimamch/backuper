import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { CloudStorage } from ".";
import { getConfigFromYaml } from "../yaml";

export const createS3Storage = (): CloudStorage => {
  const config = getConfigFromYaml().storage.s3;
  const awsClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.access_key,
      secretAccessKey: config.secret_key,
    },
  });

  const storage: CloudStorage = {
    store: async (filePath: string, fileName: string) => {
      const key = `backuper/${fileName}`;
      const upload = new Upload({
        client: awsClient,
        params: {
          Bucket: config.bucket,
          Key: key,
          ContentType: "application/zip",
          Body: fs.createReadStream(filePath),
        },
      });

      await upload.done();

      return {
        url: key,
        path: key,
      };
    },

    /**
     * delete file on AWS S3
     */
    delete: async (key: string) => {
      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      await awsClient.send(command);
    },
  };
  return storage;
};
