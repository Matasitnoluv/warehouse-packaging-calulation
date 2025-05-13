/*
  Warnings:

  - A unique constraint covering the columns `[document_product_no]` on the table `cal_box` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cal_box" ADD COLUMN     "document_product_no" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cal_box_document_product_no_key" ON "cal_box"("document_product_no");

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_document_product_no_fkey" FOREIGN KEY ("document_product_no") REFERENCES "cal_msproduct"("document_product_no") ON DELETE SET NULL ON UPDATE CASCADE;
