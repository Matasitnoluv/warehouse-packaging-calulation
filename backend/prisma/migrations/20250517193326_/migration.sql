/*
  Warnings:

  - You are about to drop the column `count` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `cubic_centimeter_box` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `document_product_no` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `total_volume` on the `shelf_box_storage` table. All the data in the column will be lost.
  - Made the column `master_warehouse_id` on table `cal_warehouse` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "cal_warehouse" DROP CONSTRAINT "cal_warehouse_master_warehouse_id_fkey";

-- DropIndex
DROP INDEX "shelf_box_storage_document_product_no_idx";

-- DropIndex
DROP INDEX "shelf_box_storage_master_shelf_id_cal_box_id_key";

-- AlterTable
ALTER TABLE "cal_warehouse" ALTER COLUMN "master_warehouse_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "shelf_box_storage" DROP COLUMN "count",
DROP COLUMN "cubic_centimeter_box",
DROP COLUMN "document_product_no",
DROP COLUMN "position",
DROP COLUMN "status",
DROP COLUMN "total_volume";

-- AddForeignKey
ALTER TABLE "cal_warehouse" ADD CONSTRAINT "cal_warehouse_master_warehouse_id_fkey" FOREIGN KEY ("master_warehouse_id") REFERENCES "masterwarehouse"("master_warehouse_id") ON DELETE RESTRICT ON UPDATE CASCADE;
