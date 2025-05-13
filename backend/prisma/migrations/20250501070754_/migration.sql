/*
  Warnings:

  - You are about to drop the column `document_product_no` on the `cal_box` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cal_box" DROP CONSTRAINT "cal_box_document_product_no_fkey";

-- AlterTable
ALTER TABLE "cal_box" DROP COLUMN "document_product_no";
