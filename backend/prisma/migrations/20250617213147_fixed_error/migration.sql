-- DropForeignKey
ALTER TABLE "cal_box" DROP CONSTRAINT "cal_box_document_product_no_fkey";

-- AlterTable
ALTER TABLE "cal_box" ADD COLUMN     "document_product_id" UUID;

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_document_product_id_fkey" FOREIGN KEY ("document_product_id") REFERENCES "cal_msproduct"("document_product_id") ON DELETE CASCADE ON UPDATE CASCADE;
