/*
  Warnings:

  - You are about to drop the column `image` on the `masterproduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "masterproduct" DROP COLUMN "image",
ADD COLUMN     "image_path" TEXT;
