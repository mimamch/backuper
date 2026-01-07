import { backup } from "./backuper";

const main = async () => {
  await backup({
    id: "test",
    name: "test",
    active: true,
    database: "postgresql",
    max_backups: 1,
    dir: {
      path: "../../to-backup",
    },
    schedule: "0 0 * * *",
    storage: "S3",
  });
};

main();
