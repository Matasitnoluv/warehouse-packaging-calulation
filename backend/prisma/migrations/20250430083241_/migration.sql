-- DropForeignKey
ALTER TABLE "cal_box" DROP CONSTRAINT "cal_box_document_product_no_fkey";

-- DropIndex
DROP INDEX "cal_box_document_product_no_key";

-- AlterTable
ALTER TABLE "cal_box" ALTER COLUMN "document_product_no" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_document_product_no_fkey" FOREIGN KEY ("document_product_no") REFERENCES "cal_msproduct"("document_product_no") ON DELETE SET NULL ON UPDATE CASCADE;
