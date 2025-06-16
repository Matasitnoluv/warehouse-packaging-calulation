import { z } from "zod";

export type TypePayloadcal_warehouse = {
    document_warehouse_id: string;
    document_warehouse_no: string;
    master_warehouse_id?: string;
    status: boolean;
    sort_by: number;
};

export const CreateCal_warehouseSchema = z.object({
    body: z.object({
        document_warehouse_no: z.string(),
        status: z.boolean(),
        sort_by: z.number(),
    }),
});

export const UpdateCal_warehouseSchema = z.object({
    body: z.object({
        document_warehouse_no: z.string(),
        document_warehouse_id: z.string(),
        sort_by: z.number(),
    }),
});

export const DeleteCal_warehouseSchema = z.object({
    params: z.object({
        document_warehouse_id: z.string(),
    }),
});