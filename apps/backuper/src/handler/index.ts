export type BackupHandlerProps = {
  dir?: {
    path: string;
  };

  postgresql?: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
};

export type DatabaseHandler = {
  backup: (props: BackupHandlerProps) => Promise<{
    path: string;
  }>;
};
