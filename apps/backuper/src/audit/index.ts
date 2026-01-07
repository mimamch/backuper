import { existsSync, readFileSync, writeFileSync } from "fs";
import { BackupPlan } from "../types/plan";
import { storages } from "../storages";

export const onBackupDone = async (
  plan: BackupPlan,
  status: "success" | "failed",
  info: {
    storage: string;
    path: string;
    size: number;
  }
) => {
  try {
    const filename = `./logs/backup_${plan.name}.json`;

    const file = existsSync(filename) ? readFileSync(filename, "utf-8") : "[]";

    const logs = JSON.parse(file) as Array<{
      timestamp: string;
      status: "success" | "failed";
      storage: string;
      path: string;
      size: number;
    }>;

    logs.push({
      timestamp: new Date().toISOString(),
      status,
      storage: info.storage,
      path: info.path,
      size: info.size,
    });

    writeFileSync(filename, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error(`Error in onBackupDone for plan ${plan.id}:`, error);
  }
};

export const checkAndClearOnReachMaxBackups = async (plan: BackupPlan) => {
  try {
    const filename = `./logs/backup_${plan.name}.json`;
    if (!existsSync(filename)) return;

    const file = readFileSync(filename, "utf-8");
    const logs = (
      JSON.parse(file) as Array<{
        timestamp: string;
        status: "success" | "failed";
        storage: string;
        path: string;
        size: number;
      }>
    ).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (logs.length <= plan.max_backups) return;

    const numToDelete = logs.length - plan.max_backups;
    const logsToKeep = logs.slice(numToDelete);
    const logsToDelete = logs.slice(0, numToDelete);

    console.log(`${plan.name} | ${numToDelete} deleted backups`);

    // delete backup files from storage if needed
    for (const log of logsToDelete) {
      const storage = storages[plan.storage];
      await storage.delete(log.path);
    }

    writeFileSync(filename, JSON.stringify(logsToKeep, null, 2));
  } catch (error) {
    console.error(
      `Error in checkAndClearOnReachMaxBackups for plan ${plan.id}:`,
      error
    );
  }
};
