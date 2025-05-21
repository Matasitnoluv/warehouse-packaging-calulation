-- AlterTable
ALTER TABLE "shelf_box_storage" ADD COLUMN     "document_warehouse_no" TEXT;

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_document_warehouse_no_fkey" FOREIGN KEY ("document_warehouse_no") REFERENCES "cal_warehouse"("document_warehouse_no") ON DELETE SET NULL ON UPDATE CASCADE;
