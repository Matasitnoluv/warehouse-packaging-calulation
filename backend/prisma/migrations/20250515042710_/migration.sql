-- CreateTable
CREATE TABLE "cal_warehouse" (
    "document_warehouse_id" UUID NOT NULL,
    "document_warehouse_name" TEXT NOT NULL,
    "status" BOOLEAN DEFAULT false,
    "status_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status_by" TEXT,
    "create_by" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),
    "sort_by" INTEGER,
    "master_warehouse_id" UUID NOT NULL,

    CONSTRAINT "cal_warehouse_pkey" PRIMARY KEY ("document_warehouse_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cal_warehouse_document_warehouse_name_key" ON "cal_warehouse"("document_warehouse_name");

-- AddForeignKey
ALTER TABLE "cal_warehouse" ADD CONSTRAINT "cal_warehouse_master_warehouse_id_fkey" FOREIGN KEY ("master_warehouse_id") REFERENCES "masterwarehouse"("master_warehouse_id") ON DELETE RESTRICT ON UPDATE CASCADE;
