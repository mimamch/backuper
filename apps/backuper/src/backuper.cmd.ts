import readline from "readline/promises";
import { prisma } from "./prisma";
import { backup } from "./backuper";

const main = async () => {
  const r = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const planId = await r.question("Backup plan ID: ");
  const backupPlan = await prisma.backupPlan.findUnique({
    where: {
      id: planId,
    },
  });

  if (!backupPlan) {
    console.error(`Backup plan ${planId} not found`);
    return;
  }

  await backup(backupPlan);
};
main();
