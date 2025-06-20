/*
  Warnings:

  - You are about to drop the column `document_product_no` on the `shelf_box_storage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "shelf_box_storage" DROP CONSTRAINT "shelf_box_storage_document_warehouse_no_fkey";

-- AlterTable
ALTER TABLE "shelf_box_storage" DROP COLUMN "document_product_no",
ADD COLUMN     "cal_warehouse_id" UUID;

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_cal_warehouse_id_fkey" FOREIGN KEY ("cal_warehouse_id") REFERENCES "cal_warehouse"("cal_warehouse_id") ON DELETE CASCADE ON UPDATE CASCADE;
