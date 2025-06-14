-- AlterTable
ALTER TABLE "cal_warehouse" ADD COLUMN     "cal_msproduct_id" UUID;

-- AddForeignKey
ALTER TABLE "cal_warehouse" ADD CONSTRAINT "cal_warehouse_cal_msproduct_id_fkey" FOREIGN KEY ("cal_msproduct_id") REFERENCES "cal_msproduct"("document_product_id") ON DELETE SET NULL ON UPDATE CASCADE;
