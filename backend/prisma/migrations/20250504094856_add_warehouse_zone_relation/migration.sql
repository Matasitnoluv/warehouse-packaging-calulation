-- AlterTable
ALTER TABLE "masterzone" ADD COLUMN     "master_warehouse_id" UUID;

-- AddForeignKey
ALTER TABLE "masterzone" ADD CONSTRAINT "masterzone_master_warehouse_id_fkey" FOREIGN KEY ("master_warehouse_id") REFERENCES "masterwarehouse"("master_warehouse_id") ON DELETE SET NULL ON UPDATE CASCADE;
