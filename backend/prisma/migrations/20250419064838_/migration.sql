-- CreateTable
CREATE TABLE "masterwarehouse" (
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT,
    "zone_id" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "cal_box_id" TEXT NOT NULL,
    "cal_box_name" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "lenght" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "cubic_centimeter_calbox" DOUBLE PRECISION,
    "create_by" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "masterwarehouse_pkey" PRIMARY KEY ("warehouse_id")
);
