import { backup } from "./backuper";

const main = async () => {
  await backup({
    id: "test",
    name: "test",
    active: true,
    database: "POSTGRES",
    max_backups: 1,
    path: "../../to-backup",
    schedule: "0 0 * * *",
    storage: "S3",
    created_at: new Date(),
    updated_at: new Date(),
  });
};

main();
