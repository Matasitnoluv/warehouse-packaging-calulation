-- AlterTable
ALTER TABLE "cal_msproduct" ADD COLUMN     "master_box_id" UUID,
ADD COLUMN     "master_product_id" UUID;

-- AddForeignKey
ALTER TABLE "cal_msproduct" ADD CONSTRAINT "cal_msproduct_master_box_id_fkey" FOREIGN KEY ("master_box_id") REFERENCES "masterbox"("master_box_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cal_msproduct" ADD CONSTRAINT "cal_msproduct_master_product_id_fkey" FOREIGN KEY ("master_product_id") REFERENCES "masterproduct"("master_product_id") ON DELETE SET NULL ON UPDATE CASCADE;
