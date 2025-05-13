/*
  Warnings:

  - You are about to drop the column `cubic_centimeter_calbox` on the `masterwarehouse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "masterwarehouse" DROP COLUMN "cubic_centimeter_calbox",
ADD COLUMN     "cubic_centimeter_warehouse" DOUBLE PRECISION;
