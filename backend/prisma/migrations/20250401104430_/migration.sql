-- CreateTable
CREATE TABLE "cal_box" (
    "cal_box_id" UUID NOT NULL,
    "code_box" TEXT,
    "master_product_name" TEXT,
    "code_product" TEXT,
    "scale_box" INTEGER,
    "create_by" TEXT,
    "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT,
    "update_date" TIMESTAMP(3),

    CONSTRAINT "cal_box_pkey" PRIMARY KEY ("cal_box_id")
);
