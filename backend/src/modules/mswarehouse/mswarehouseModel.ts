import { z } from "zod";

export type TypePayloadMsWarehouse = {
    master_warehouse_id: string; // ID ของคลังสินค้า
    master_warehouse_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_warehouse: number; // ปริมาตรในหน่วยลูกบาศก์เซนติเมตร
    description: string;
    create_by: string;
    create_date: string;
    update_by: string;
    update_date: string;
};

export const CreateMsWarehouseSchema = z.object({
    body: z.object({
        master_warehouse_name: z.string(), // ID ของคลังสินค้า
        height: z.number(),
        length: z.number(),
        width: z.number(),
        cubic_centimeter_warehouse: z.number(),
        description: z.string(),
    }),
});

export const UpdateMsWarehouseSchema = z.object({
    body: z.object({
        master_warehouse_name: z.string(), // ID ของคลังสินค้า
        height: z.number(),
        length: z.number(),
        width: z.number(),
        cubic_centimeter_warehouse: z.number(),
        description: z.string(),
    }),
});

export const DeleteMsWarehouseSchema = z.object({
    params: z.object({
        master_warehouse_id: z.string(), // ID ของคลังสินค้า
    }),
});


