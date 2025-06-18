-- AlterTable
ALTER TABLE "rack_box_storage" ADD COLUMN     "shelf_id" UUID;

-- CreateTable
CREATE TABLE "masterrack_shelf" (
    "shelf_id" UUID NOT NULL,
    "shelf_name" TEXT,
    "shelf_number" INTEGER,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "cubic_centimeter_shelf" DOUBLE PRECISION,
    "description" TEXT,
    "master_rack_id" UUID,
    "create_by" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "masterrack_shelf_pkey" PRIMARY KEY ("shelf_id")
);

-- AddForeignKey
ALTER TABLE "rack_box_storage" ADD CONSTRAINT "rack_box_storage_shelf_id_fkey" FOREIGN KEY ("shelf_id") REFERENCES "masterrack_shelf"("shelf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masterrack_shelf" ADD CONSTRAINT "masterrack_shelf_master_rack_id_fkey" FOREIGN KEY ("master_rack_id") REFERENCES "masterrack"("master_rack_id") ON DELETE SET NULL ON UPDATE CASCADE;
