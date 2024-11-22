import { BackupPlan, Storage as S } from "@prisma/client";
import cron from "node-cron";
import { CloudStorage } from "./storages";
import { createS3Storage } from "./storages/s3";
import { zipDir } from "./archiver/zip";
import fs, { existsSync } from "fs";
import { prisma } from "./prisma";

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

const storages: Record<S, CloudStorage> = {
  S3: createS3Storage(),
};

const backup = async (plan: BackupPlan) => {
  try {
    console.log(`Backing up plan ${plan.id} - ${plan.name}`);

    const storage = storages[plan.storage];
    const zipPath = await zipDir(plan.path, `${plan.name}.zip`);

    const zip = new File(
      [fs.readFileSync(zipPath)],
      `${plan.name}-${new Date().toISOString()}.zip`,
      {
        type: "application/zip",
      }
    );
    const response = await storage.store(zip);

    await prisma.backup.create({
      data: {
        plan_id: plan.id,
        path: response.path,
        url: response.url,
        size: zip.size,
      },
    });

    existsSync(zipPath) && fs.unlinkSync(zipPath);

    console.log(`Backup plan ${plan.id} completed: ${response.url}`);

    checkAndClearOnReachMaxBackups(plan);
  } catch (error) {
    console.error(`Error backing up plan ${plan.id}:`, error);
  }
};

const checkAndClearOnReachMaxBackups = async (plan: BackupPlan) => {
  const backups = await prisma.backup.findMany({
    where: {
      plan_id: plan.id,
    },
    orderBy: [
      {
        created_at: "desc",
      },
    ],
  });

  if (backups.length <= plan.max_backups) {
    return;
  }

  const toDelete = backups.slice(plan.max_backups);

  for (const backup of toDelete) {
    const storage = storages[plan.storage];
    await storage.delete(backup.path);
    await prisma.backup.delete({
      where: {
        id: backup.id,
      },
    });
  }

  console.log(`Deleted ${toDelete.length} backups for plan ${plan.id}`);
};
