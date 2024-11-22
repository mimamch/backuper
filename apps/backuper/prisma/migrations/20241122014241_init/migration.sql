-- CreateEnum
CREATE TYPE "databases" AS ENUM ('POSTGRES');

-- CreateEnum
CREATE TYPE "storages" AS ENUM ('S3');

-- CreateTable
CREATE TABLE "backup_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "database" "databases" NOT NULL,
    "storage" "storages" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "max_backups" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "backup_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
