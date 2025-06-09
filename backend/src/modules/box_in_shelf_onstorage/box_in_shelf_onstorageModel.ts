import { z } from "zod";

export type BoxInShelfType = {
    master_shelf_id: string;
    document_warehouse_no: string;
    master_warehouse_id: string;
    master_zone_id: string;
    fitBoxes: Array<{
        cal_box_id: string;
        document_product_no: string;
        cubic_centimeter_box: number;
        count: number;
        total_volume: number;
        stored_date?: Date;
    }>;
};

export const CreateBoxInShelfSchema = z.object({
    body: z.object({
        master_shelf_id: z.string(),
        document_warehouse_no: z.string(),
        master_warehouse_id: z.string(),
        fitBoxes: z.array(z.object({
            cal_box_id: z.string(),
            document_product_no: z.string(),
            cubic_centimeter_box: z.number(),
            count: z.number(),
            total_volume: z.number()
        }))
    })
});

export const UpdateBoxInShelfSchema = z.object({
    body: z.object({
        master_shelf_id: z.string(),
        document_warehouse_no: z.string(),
        fitBoxes: z.array(z.object({
            cal_box_id: z.string(),
            document_product_no: z.string(),
            cubic_centimeter_box: z.number(),
            count: z.number(),
            total_volume: z.number()
        }))
    })
});

export const DeleteBoxInShelfSchema = z.object({
    params: z.object({
        storage_id: z.string()
    })
});
