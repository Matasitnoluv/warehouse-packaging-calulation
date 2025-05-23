-- CreateTable
CREATE TABLE "group_box" (
    "group_box_id" UUID NOT NULL,
    "document_product_no" TEXT,
    "box_no" INTEGER,

    CONSTRAINT "group_box_pkey" PRIMARY KEY ("group_box_id")
);

-- CreateTable
CREATE TABLE "_cal_boxTogroup_box" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_cal_boxTogroup_box_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_cal_boxTogroup_box_B_index" ON "_cal_boxTogroup_box"("B");

-- AddForeignKey
ALTER TABLE "_cal_boxTogroup_box" ADD CONSTRAINT "_cal_boxTogroup_box_A_fkey" FOREIGN KEY ("A") REFERENCES "cal_box"("cal_box_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cal_boxTogroup_box" ADD CONSTRAINT "_cal_boxTogroup_box_B_fkey" FOREIGN KEY ("B") REFERENCES "group_box"("group_box_id") ON DELETE CASCADE ON UPDATE CASCADE;
