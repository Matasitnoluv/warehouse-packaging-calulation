/*
  Warnings:

  - The primary key for the `cal_warehouse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `document_warehouse_id` on the `cal_warehouse` table. All the data in the column will be lost.
  - You are about to drop the column `master_zone_id` on the `cal_warehouse` table. All the data in the column will be lost.
  - The required column `cal_warehouse_id` was added to the `cal_warehouse` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "cal_warehouse" DROP CONSTRAINT "cal_warehouse_master_zone_id_fkey";

-- AlterTable
ALTER TABLE "cal_warehouse" DROP CONSTRAINT "cal_warehouse_pkey",
DROP COLUMN "document_warehouse_id",
DROP COLUMN "master_zone_id",
ADD COLUMN     "cal_warehouse_id" UUID NOT NULL,
ADD CONSTRAINT "cal_warehouse_pkey" PRIMARY KEY ("cal_warehouse_id");

-- CreateTable
CREATE TABLE "MasterZoneOnCalWarehouse" (
    "cal_warehouse_id" UUID NOT NULL,
    "master_zone_id" UUID NOT NULL,

    CONSTRAINT "MasterZoneOnCalWarehouse_pkey" PRIMARY KEY ("cal_warehouse_id","master_zone_id")
);

-- AddForeignKey
ALTER TABLE "MasterZoneOnCalWarehouse" ADD CONSTRAINT "MasterZoneOnCalWarehouse_cal_warehouse_id_fkey" FOREIGN KEY ("cal_warehouse_id") REFERENCES "cal_warehouse"("cal_warehouse_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterZoneOnCalWarehouse" ADD CONSTRAINT "MasterZoneOnCalWarehouse_master_zone_id_fkey" FOREIGN KEY ("master_zone_id") REFERENCES "masterzone"("master_zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;
