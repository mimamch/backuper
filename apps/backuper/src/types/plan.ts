export type BackupPlan = {
  id: string;
  name: string;

  schedule: string;
  database: "dir" | "postgresql";
  storage: "S3";
  active: boolean;
  max_backups: number;

  postgresql?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };

  dir?: {
    path: string;
  };
};
