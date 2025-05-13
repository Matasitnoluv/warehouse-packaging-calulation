/*
  Warnings:

  - You are about to drop the column `scale_product` on the `cal_msproduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cal_msproduct" DROP COLUMN "scale_product",
ALTER COLUMN "cal_product_name" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL,
ALTER COLUMN "length" DROP NOT NULL,
ALTER COLUMN "width" DROP NOT NULL,
ALTER COLUMN "sum_volume" DROP NOT NULL,
ALTER COLUMN "cubic_centimeter_calproduct" DROP NOT NULL;
