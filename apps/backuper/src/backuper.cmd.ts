import readline from "readline/promises";
import { backup } from "./backuper";
import { getConfigFromYaml } from "./yaml";

const main = async () => {
  const r = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const planId = await r.question("Backup plan name: ");

  const plans = getConfigFromYaml().plans;
  const backupPlan = plans.find((p) => p.name === planId);

  if (!backupPlan) {
    console.error(`Backup plan ${planId} not found`);
    return;
  }

  await backup({
    id: backupPlan.id || "",
    name: backupPlan.name,
    schedule: backupPlan.schedule,
    database: backupPlan.type,
    storage: "S3",
    active: backupPlan.active,
    max_backups: backupPlan.max_backups,
    postgresql: backupPlan.postgresql,
    dir: backupPlan.dir,
  });
};
main();
