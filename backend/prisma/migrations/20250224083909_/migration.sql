/*
  Warnings:

  - The primary key for the `cal_msproduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cal_product_id` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `cal_product_name` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `cubic_centimeter_calproduct` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `sort_by` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `sum_volume` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `cal_msproduct` table. All the data in the column will be lost.
  - You are about to drop the `cal_msbox` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `document_product_id` to the `cal_msproduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cal_msproduct" DROP CONSTRAINT "cal_msproduct_pkey",
DROP COLUMN "cal_product_id",
DROP COLUMN "cal_product_name",
DROP COLUMN "count",
DROP COLUMN "cubic_centimeter_calproduct",
DROP COLUMN "height",
DROP COLUMN "length",
DROP COLUMN "sort_by",
DROP COLUMN "sum_volume",
DROP COLUMN "width",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status_by" TEXT,
ADD COLUMN     "status_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "document_product_id",
ADD COLUMN     "document_product_id" UUID NOT NULL,
ADD CONSTRAINT "cal_msproduct_pkey" PRIMARY KEY ("document_product_id");

-- DropTable
DROP TABLE "cal_msbox";
