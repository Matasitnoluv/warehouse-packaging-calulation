/*
  Warnings:

  - You are about to drop the column `box_no` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `code_box` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `code_product` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `master_box_name` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `master_product_name` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `master_rack_id` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `master_rack_name` on the `shelf_box_storage` table. All the data in the column will be lost.
  - You are about to drop the column `master_zone_id` on the `shelf_box_storage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shelf_box_storage" DROP COLUMN "box_no",
DROP COLUMN "code_box",
DROP COLUMN "code_product",
DROP COLUMN "master_box_name",
DROP COLUMN "master_product_name",
DROP COLUMN "master_rack_id",
DROP COLUMN "master_rack_name",
DROP COLUMN "master_zone_id",
ALTER COLUMN "count" DROP NOT NULL,
ALTER COLUMN "cubic_centimeter_box" DROP NOT NULL,
ALTER COLUMN "document_product_no" DROP NOT NULL;
