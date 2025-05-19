/*
  Warnings:

  - Added the required column `total_volume` to the `shelf_box_storage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shelf_box_storage" ADD COLUMN     "count" INTEGER,
ADD COLUMN     "cubic_centimeter_box" DOUBLE PRECISION,
ADD COLUMN     "document_product_no" TEXT,
ADD COLUMN     "position" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'stored',
ADD COLUMN     "total_volume" DOUBLE PRECISION NOT NULL;
