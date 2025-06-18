-- AlterTable
ALTER TABLE "cal_warehouse" ADD COLUMN     "master_zone_id" UUID;

-- AddForeignKey
ALTER TABLE "cal_warehouse" ADD CONSTRAINT "cal_warehouse_master_zone_id_fkey" FOREIGN KEY ("master_zone_id") REFERENCES "masterzone"("master_zone_id") ON DELETE SET NULL ON UPDATE CASCADE;
