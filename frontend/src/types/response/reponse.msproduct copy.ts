import { z } from "zod";
import { TypeMsbox } from "./reponse.msbox";
import { TypeCalBox } from "./reponse.cal_box";

export const shelfBoxStorageSchema = z.object({
    storage_id: z.string().uuid().optional(),
    master_shelf_id: z.string().uuid(),
    cal_box_id: z.string().uuid(),
    stored_date: z.date().optional(),
    stored_by: z.string().nullable().optional(),
    status: z.string().default("stored"),
    position: z.number().int().nullable().optional(),
    document_product_no: z.string().nullable().optional(),
    cubic_centimeter_box: z.number().nullable().optional(),
    count: z.number().int().nullable().optional(),
    total_volume: z.number(),
    document_warehouse_no: z.string().nullable().optional(),
});

export type TypeShelfBoxStorage = {
    storage_id?: string;
    master_shelf_id: string;
    cal_box_id: string;
    stored_date?: Date;
    stored_by?: string | null;
    status?: string;
    position?: number | null;
    document_product_no?: string | null;
    cubic_centimeter_box?: number | null;
    count?: number | null;
    total_volume: number;
    document_warehouse_no?: string | null;
    box_no?: number | null;
    cal_box: TypeMsbox & { cal_box_id?: string } & TypeCalBox;
};


export type ZTypeShelfBoxStorage = z.infer<typeof shelfBoxStorageSchema>;