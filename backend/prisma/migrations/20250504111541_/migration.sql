-- CreateTable
CREATE TABLE "masterrack" (
    "master_rack_id" UUID NOT NULL,
    "master_rack_name" TEXT,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "cubic_centimeter_rack" DOUBLE PRECISION,
    "description" TEXT,
    "master_zone_id" UUID,
    "create_by" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "masterrack_pkey" PRIMARY KEY ("master_rack_id")
);

-- AddForeignKey
ALTER TABLE "masterrack" ADD CONSTRAINT "masterrack_master_zone_id_fkey" FOREIGN KEY ("master_zone_id") REFERENCES "masterzone"("master_zone_id") ON DELETE SET NULL ON UPDATE CASCADE;
