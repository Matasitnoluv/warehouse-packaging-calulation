/*
  Warnings:

  - The primary key for the `masterwarehouse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cal_box_id` on the `masterwarehouse` table. All the data in the column will be lost.
  - You are about to drop the column `cal_box_name` on the `masterwarehouse` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_id` on the `masterwarehouse` table. All the data in the column will be lost.
  - You are about to drop the column `warehouse_name` on the `masterwarehouse` table. All the data in the column will be lost.
  - You are about to drop the column `zone_id` on the `masterwarehouse` table. All the data in the column will be lost.
  - You are about to drop the column `zone_name` on the `masterwarehouse` table. All the data in the column will be lost.
  - The required column `master_warehouse_id` was added to the `masterwarehouse` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "masterwarehouse" DROP CONSTRAINT "masterwarehouse_pkey",
DROP COLUMN "cal_box_id",
DROP COLUMN "cal_box_name",
DROP COLUMN "warehouse_id",
DROP COLUMN "warehouse_name",
DROP COLUMN "zone_id",
DROP COLUMN "zone_name",
ADD COLUMN     "master_warehouse_id" UUID NOT NULL,
ADD COLUMN     "master_warehouse_name" TEXT,
ADD CONSTRAINT "masterwarehouse_pkey" PRIMARY KEY ("master_warehouse_id");
