/*
  Warnings:

  - The `zone_id` column on the `masterwarehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cal_box_id` column on the `masterwarehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "masterwarehouse" DROP COLUMN "zone_id",
ADD COLUMN     "zone_id" UUID,
ALTER COLUMN "zone_name" DROP NOT NULL,
DROP COLUMN "cal_box_id",
ADD COLUMN     "cal_box_id" UUID,
ALTER COLUMN "cal_box_name" DROP NOT NULL;
