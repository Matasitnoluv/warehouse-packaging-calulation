/*
  Warnings:

  - You are about to drop the column `lenght` on the `masterwarehouse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "masterwarehouse" DROP COLUMN "lenght",
ADD COLUMN     "length" DOUBLE PRECISION;
