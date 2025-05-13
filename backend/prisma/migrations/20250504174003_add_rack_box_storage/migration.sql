-- CreateTable
CREATE TABLE "rack_box_storage" (
    "storage_id" UUID NOT NULL,
    "master_rack_id" UUID NOT NULL,
    "cal_box_id" UUID NOT NULL,
    "stored_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stored_by" TEXT,
    "position" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'stored',

    CONSTRAINT "rack_box_storage_pkey" PRIMARY KEY ("storage_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rack_box_storage_master_rack_id_cal_box_id_key" ON "rack_box_storage"("master_rack_id", "cal_box_id");

-- AddForeignKey
ALTER TABLE "rack_box_storage" ADD CONSTRAINT "rack_box_storage_master_rack_id_fkey" FOREIGN KEY ("master_rack_id") REFERENCES "masterrack"("master_rack_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rack_box_storage" ADD CONSTRAINT "rack_box_storage_cal_box_id_fkey" FOREIGN KEY ("cal_box_id") REFERENCES "cal_box"("cal_box_id") ON DELETE RESTRICT ON UPDATE CASCADE;
