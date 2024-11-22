import fs from "fs";
import { backuper } from "./backuper";
import { prisma } from "./prisma";

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

const main = async () => {
  const plans = await prisma.backupPlan.findMany({});

  console.log(plans);

  for (const plan of plans) {
    await backuper(plan);
  }
};

setInterval(main, 1000 * 60);
main();
