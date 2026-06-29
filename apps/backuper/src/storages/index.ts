import { createS3Storage } from "./s3";

export type CloudStorage = {
  store: (filePath: string, fileName: string) => Promise<{
    url: string;
    path: string;
  }>;
  delete: (key: string) => Promise<void>;
};

type Storage = "S3";

export const storages: Record<Storage, CloudStorage> = {
  S3: createS3Storage(),
};
