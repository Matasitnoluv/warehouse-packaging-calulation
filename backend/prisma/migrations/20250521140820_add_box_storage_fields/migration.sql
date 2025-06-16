/*
  Warnings:

  - Added the required column `box_no` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_box` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_product` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `master_box_name` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `master_product_name` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.
  - Made the column `count` on table `shelf_box_storage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cubic_centimeter_box` on table `shelf_box_storage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `document_product_no` on table `shelf_box_storage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shelf_box_storage" ADD COLUMN     "box_no" INTEGER NOT NULL,
ADD COLUMN     "code_box" TEXT NOT NULL,
ADD COLUMN     "code_product" TEXT NOT NULL,
ADD COLUMN     "master_box_name" TEXT NOT NULL,
ADD COLUMN     "master_product_name" TEXT NOT NULL,
ADD COLUMN     "master_rack_id" TEXT,
ADD COLUMN     "master_rack_name" TEXT,
ADD COLUMN     "master_zone_id" TEXT,
ALTER COLUMN "count" SET NOT NULL,
ALTER COLUMN "cubic_centimeter_box" SET NOT NULL,
ALTER COLUMN "document_product_no" SET NOT NULL;
