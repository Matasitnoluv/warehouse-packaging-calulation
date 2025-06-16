-- DropForeignKey
ALTER TABLE "cal_box" DROP CONSTRAINT "cal_box_document_product_no_fkey";

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_document_product_no_fkey" FOREIGN KEY ("document_product_no") REFERENCES "cal_msproduct"("document_product_no") ON DELETE CASCADE ON UPDATE CASCADE;
