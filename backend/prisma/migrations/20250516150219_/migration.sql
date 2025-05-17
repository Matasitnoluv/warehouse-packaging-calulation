-- DropForeignKey
ALTER TABLE "cal_warehouse" DROP CONSTRAINT "cal_warehouse_master_warehouse_id_fkey";

-- AlterTable
ALTER TABLE "cal_warehouse" ALTER COLUMN "master_warehouse_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cal_warehouse" ADD CONSTRAINT "cal_warehouse_master_warehouse_id_fkey" FOREIGN KEY ("master_warehouse_id") REFERENCES "masterwarehouse"("master_warehouse_id") ON DELETE SET NULL ON UPDATE CASCADE;
