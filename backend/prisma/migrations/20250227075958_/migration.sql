/*
  Warnings:

  - A unique constraint covering the columns `[document_product_no]` on the table `cal_msproduct` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document_product_no` to the `cal_msproduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cal_msproduct" ADD COLUMN     "document_product_no" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cal_msproduct_document_product_no_key" ON "cal_msproduct"("document_product_no");
