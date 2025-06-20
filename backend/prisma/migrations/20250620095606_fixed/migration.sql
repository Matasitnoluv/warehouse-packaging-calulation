/*
  Warnings:

  - You are about to drop the column `document_warehouse_no` on the `shelf_box_storage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "shelf_box_storage_document_warehouse_no_idx";

-- AlterTable
ALTER TABLE "shelf_box_storage" DROP COLUMN "document_warehouse_no";

-- CreateIndex
CREATE INDEX "shelf_box_storage_cal_warehouse_id_idx" ON "shelf_box_storage"("cal_warehouse_id");
