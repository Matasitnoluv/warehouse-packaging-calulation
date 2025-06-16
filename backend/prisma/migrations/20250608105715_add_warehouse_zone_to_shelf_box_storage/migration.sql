-- AlterTable
ALTER TABLE "shelf_box_storage" ADD COLUMN     "master_warehouse_id" UUID,
ADD COLUMN     "master_zone_id" UUID;

-- CreateIndex
CREATE INDEX "shelf_box_storage_master_warehouse_id_idx" ON "shelf_box_storage"("master_warehouse_id");

-- CreateIndex
CREATE INDEX "shelf_box_storage_master_zone_id_idx" ON "shelf_box_storage"("master_zone_id");

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_master_warehouse_id_fkey" FOREIGN KEY ("master_warehouse_id") REFERENCES "masterwarehouse"("master_warehouse_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_master_zone_id_fkey" FOREIGN KEY ("master_zone_id") REFERENCES "masterzone"("master_zone_id") ON DELETE SET NULL ON UPDATE CASCADE;
