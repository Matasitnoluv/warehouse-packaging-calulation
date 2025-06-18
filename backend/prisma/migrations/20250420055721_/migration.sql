/*
  Warnings:

  - A unique constraint covering the columns `[box_no]` on the table `cal_box` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cal_box" ADD COLUMN     "box_no" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "cal_box_box_no_key" ON "cal_box"("box_no");
