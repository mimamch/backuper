import cron from "node-cron";
import { storages } from "./storages";
import fs, { existsSync } from "fs";
import { DatabaseHandler } from "./handler";
import { dirHandler } from "./handler/dir";
import { BackupPlan } from "./types/plan";
import { Database } from "./types/database";
import { checkAndClearOnReachMaxBackups, onBackupDone } from "./audit";
import { postgresqlHandler } from "./handler/postgresql";

const getObjectSha = (obj: Record<any, any>) => {
  return JSON.stringify(obj);
};

const runningBackups = new Map<
  string,
  {
    cron: cron.ScheduledTask;
    sha: string;
  }
>();

export const backuper = async (plan: BackupPlan) => {
  const existing = runningBackups.get(plan.id);
  if (existing) {
    if (existing.sha == getObjectSha(plan)) {
      return;
    } else {
      console.log(`Plan ${plan.id} is different, restarting`);
      existing.cron.stop();
      runningBackups.delete(plan.id);
    }
  }

  if (!plan.active) {
    runningBackups.get(plan.id)?.cron.stop();
    runningBackups.delete(plan.id);
    return;
  }

  runningBackups.set(plan.id, {
    cron: cron.schedule(plan.schedule, async () => {
      backup(plan);
    }),
    sha: getObjectSha(plan),
  });
};

const databases: Record<Database, DatabaseHandler> = {
  dir: dirHandler(),

  postgresql: postgresqlHandler(),
};

export const backup = async (plan: BackupPlan) => {
  try {
    console.log(`Backing up plan ${plan.id} - ${plan.name}`);

    const storage = storages[plan.storage];
    const handler = databases[plan.database];

    if (!handler) {
      throw new Error("Unsupported database type or missing configuration");
    }

    const { path: zipPath } = await handler.backup({
      dir: plan.dir,
      postgresql: plan.postgresql,
    });

    const zip = new File(
      [fs.readFileSync(zipPath) as unknown as Blob],
      `${plan.name}-${new Date().toISOString()}.zip`,
      {
        type: "application/zip",
      }
    );
    const response = await storage.store(zip);

    await onBackupDone(plan, "success", {
      path: response.path,
      size: zip.size,
      storage: plan.storage,
    });

    existsSync(zipPath) && fs.unlinkSync(zipPath);

    console.log(`Backup plan ${plan.id} completed: ${response.url}`);

    checkAndClearOnReachMaxBackups(plan);
  } catch (error) {
    console.error(`Error backing up plan ${plan.id}:`, error);
  }
};
