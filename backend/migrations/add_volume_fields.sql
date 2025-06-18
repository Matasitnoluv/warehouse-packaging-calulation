-- Add volume and document information columns to rack_box_storage table
ALTER TABLE "rack_box_storage" 
ADD COLUMN IF NOT EXISTS "cubic_centimeter_box" NUMERIC,
ADD COLUMN IF NOT EXISTS "count" INTEGER,
ADD COLUMN IF NOT EXISTS "total_volume" NUMERIC,
ADD COLUMN IF NOT EXISTS "document_product_no" VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_rack_box_storage_document" ON "rack_box_storage" ("document_product_no");
