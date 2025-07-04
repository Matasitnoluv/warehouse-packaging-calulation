/*
  Warnings:

  - Added the required column `master_rack_id` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shelf_box_storage" ADD COLUMN     "master_rack_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "_WarehouseZones" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_WarehouseZones_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WarehouseZones_B_index" ON "_WarehouseZones"("B");

-- CreateIndex
CREATE INDEX "shelf_box_storage_master_rack_id_idx" ON "shelf_box_storage"("master_rack_id");

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_document_product_no_fkey" FOREIGN KEY ("document_product_no") REFERENCES "cal_msproduct"("document_product_no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_master_rack_id_fkey" FOREIGN KEY ("master_rack_id") REFERENCES "masterrack"("master_rack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WarehouseZones" ADD CONSTRAINT "_WarehouseZones_B_fkey" FOREIGN KEY ("B") REFERENCES "masterzone"("master_zone_id") ON DELETE CASCADE ON UPDATE CASCADE;
