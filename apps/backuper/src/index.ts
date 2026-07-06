import fs from "fs";
import { backuper } from "./backuper";
import { getConfigFromYaml } from "./yaml";

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}
if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

const refresh = async () => {
  const config = getConfigFromYaml();

  for (const plan of config.plans) {
    await backuper({
      id: plan.name,
      name: plan.name,
      active: plan.active,
      schedule: plan.schedule,
      max_backups: plan.max_backups,
      database: plan.type,
      storage: "S3",

      postgresql: plan.postgresql,
      dir: plan.dir,
    });
  }
};

const main = async () => {
  console.log(`Starting backuper at ${new Date().toISOString()}`);
  refresh();
  setInterval(refresh, 1000 * 60);
};

main();
