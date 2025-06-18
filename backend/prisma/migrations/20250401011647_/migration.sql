/*
  Warnings:

  - A unique constraint covering the columns `[code_product]` on the table `masterproduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "masterproduct" ADD COLUMN     "code_product" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "masterproduct_code_product_key" ON "masterproduct"("code_product");
