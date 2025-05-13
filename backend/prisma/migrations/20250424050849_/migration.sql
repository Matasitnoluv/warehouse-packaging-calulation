/*
  Warnings:

  - You are about to drop the column `image` on the `masterbox` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "masterbox" DROP COLUMN "image",
ADD COLUMN     "image_path" TEXT;
