export type CloudStorage = {
  store: (file: File) => Promise<{
    url: string;
    path: string;
  }>;
  delete: (key: string) => Promise<void>;
};
