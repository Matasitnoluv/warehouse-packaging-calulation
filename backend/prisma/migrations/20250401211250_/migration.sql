/*
  Warnings:

  - You are about to drop the column `scale_box` on the `cal_box` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cal_box" DROP COLUMN "scale_box",
ADD COLUMN     "count" INTEGER,
ADD COLUMN     "cubic_centimeter_box" INTEGER;
