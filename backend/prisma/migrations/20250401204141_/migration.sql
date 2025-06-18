-- AlterTable
ALTER TABLE "cal_box" ADD COLUMN     "master_box_id" UUID,
ADD COLUMN     "master_box_name" TEXT,
ADD COLUMN     "master_product_id" UUID;

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_master_box_id_fkey" FOREIGN KEY ("master_box_id") REFERENCES "masterbox"("master_box_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cal_box" ADD CONSTRAINT "cal_box_master_product_id_fkey" FOREIGN KEY ("master_product_id") REFERENCES "masterproduct"("master_product_id") ON DELETE SET NULL ON UPDATE CASCADE;
