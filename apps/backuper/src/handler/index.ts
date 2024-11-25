export type DatabaseHandler = {
  backup: (props: { dirPath: string }) => Promise<{
    path: string;
  }>;
};
