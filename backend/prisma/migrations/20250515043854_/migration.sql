/*
  Warnings:

  - You are about to drop the column `document_warehouse_name` on the `cal_warehouse` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[document_warehouse_no]` on the table `cal_warehouse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document_warehouse_no` to the `cal_warehouse` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cal_warehouse_document_warehouse_name_key";

-- AlterTable
ALTER TABLE "cal_warehouse" DROP COLUMN "document_warehouse_name",
ADD COLUMN     "document_warehouse_no" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cal_warehouse_document_warehouse_no_key" ON "cal_warehouse"("document_warehouse_no");
