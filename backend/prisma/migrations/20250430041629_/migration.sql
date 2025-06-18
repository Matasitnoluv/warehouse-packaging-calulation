-- CreateTable
CREATE TABLE "masterzone" (
    "master_zone_id" UUID NOT NULL,
    "master_zone_name" TEXT,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "cubic_centimeter_zone" DOUBLE PRECISION,
    "description" TEXT,
    "create_by" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "masterzone_pkey" PRIMARY KEY ("master_zone_id")
);
