import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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
    /**
     * Store file to AWS S3
     */
    store: async (file: File) => {
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: `backuper/${file.name}`,
        ContentType: file.type,
        Body: Buffer.from(await file.arrayBuffer()),
      });

      await awsClient.send(command);

      return {
        url: `backuper/${file.name}`,
        path: `backuper/${file.name}`,
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
