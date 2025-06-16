-- DropForeignKey
ALTER TABLE "shelf_box_storage" DROP CONSTRAINT "shelf_box_storage_document_warehouse_no_fkey";

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_document_warehouse_no_fkey" FOREIGN KEY ("document_warehouse_no") REFERENCES "cal_warehouse"("document_warehouse_no") ON DELETE CASCADE ON UPDATE CASCADE;
