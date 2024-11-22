import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../env";
import { CloudStorage } from ".";

export const createS3Storage = (): CloudStorage => {
  const awsClient = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
  });

  const storage: CloudStorage = {
    /**
     * Store file to AWS S3
     */
    store: async (file: File) => {
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `backuper/${file.name}`,
        // ContentType: file.type,
        Body: Buffer.from(await file.arrayBuffer()),
      });

      await awsClient.send(command);

      return {
        url: env.S3_INDEX_BASE_URL + `/backuper/${file.name}`,
        path: `backuper/${file.name}`,
      };
    },

    /**
     * delete file on AWS S3
     */
    delete: async (key: string) => {
      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      });

      await awsClient.send(command);
    },
  };
  return storage;
};
