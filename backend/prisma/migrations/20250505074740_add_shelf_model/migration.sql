/*
  Warnings:

  - You are about to drop the column `shelf_id` on the `rack_box_storage` table. All the data in the column will be lost.
  - You are about to drop the `masterrack_shelf` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "masterrack_shelf" DROP CONSTRAINT "masterrack_shelf_master_rack_id_fkey";

-- DropForeignKey
ALTER TABLE "rack_box_storage" DROP CONSTRAINT "rack_box_storage_shelf_id_fkey";

-- AlterTable
ALTER TABLE "rack_box_storage" DROP COLUMN "shelf_id";

-- DropTable
DROP TABLE "masterrack_shelf";

-- CreateTable
CREATE TABLE "mastershelf" (
    "master_shelf_id" UUID NOT NULL,
    "master_shelf_name" TEXT,
    "shelf_level" INTEGER,
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

    CONSTRAINT "mastershelf_pkey" PRIMARY KEY ("master_shelf_id")
);

-- CreateTable
CREATE TABLE "shelf_box_storage" (
    "storage_id" UUID NOT NULL,
    "master_shelf_id" UUID NOT NULL,
    "cal_box_id" UUID NOT NULL,
    "stored_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stored_by" TEXT,
    "position" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'stored',
    "cubic_centimeter_box" DOUBLE PRECISION,
    "count" INTEGER,
    "total_volume" DOUBLE PRECISION,
    "document_product_no" TEXT,

    CONSTRAINT "shelf_box_storage_pkey" PRIMARY KEY ("storage_id")
);

-- CreateIndex
CREATE INDEX "shelf_box_storage_document_product_no_idx" ON "shelf_box_storage"("document_product_no");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_box_storage_master_shelf_id_cal_box_id_key" ON "shelf_box_storage"("master_shelf_id", "cal_box_id");

-- AddForeignKey
ALTER TABLE "mastershelf" ADD CONSTRAINT "mastershelf_master_rack_id_fkey" FOREIGN KEY ("master_rack_id") REFERENCES "masterrack"("master_rack_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_master_shelf_id_fkey" FOREIGN KEY ("master_shelf_id") REFERENCES "mastershelf"("master_shelf_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_box_storage" ADD CONSTRAINT "shelf_box_storage_cal_box_id_fkey" FOREIGN KEY ("cal_box_id") REFERENCES "cal_box"("cal_box_id") ON DELETE RESTRICT ON UPDATE CASCADE;
