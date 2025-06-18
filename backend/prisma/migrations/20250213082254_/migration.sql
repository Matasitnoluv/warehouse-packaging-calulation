/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "user" (
    "users_id" TEXT NOT NULL,
    "fullname" TEXT,
    "age" INTEGER NOT NULL,
    "address" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status_role" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "create_by" TEXT,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("users_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
