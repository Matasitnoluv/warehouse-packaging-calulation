-- AlterTable
ALTER TABLE "rack_box_storage" ADD COLUMN     "count" INTEGER,
ADD COLUMN     "cubic_centimeter_box" DOUBLE PRECISION,
ADD COLUMN     "document_product_no" TEXT,
ADD COLUMN     "total_volume" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "rack_box_storage_document_product_no_idx" ON "rack_box_storage"("document_product_no");
