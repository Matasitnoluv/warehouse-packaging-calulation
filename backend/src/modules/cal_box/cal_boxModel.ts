import { z } from "zod";

export type TypePayloadcal_box = {
    cal_box_id: string;
    document_product_no: string;
    box_no: number;
    master_box_name: string;
    code_box: string;
    master_product_name: string;
    code_product: string;
    cubic_centimeter_box: number;
    count: number;
};

export const CreateCal_boxSchema = z.object({
    body: z.object({
        master_box_name: z.string(),
        document_product_no: z.string(),
        box_no: z.number(),
        code_box: z.string(),
        master_product_name: z.string(),
        code_product: z.string(),
        cubic_centimeter_box: z.number(),
        count: z.number(),
    }),
});

export const UpdateCal_boxSchema = z.object({
    body: z.object({
        master_box_name: z.string(),
        document_product_no: z.string(),
        code_box: z.string(),
        box_no: z.number(),
        master_product_name: z.string(),
        code_product: z.string(),
        cubic_centimeter_box: z.number(),
        count: z.number(),
    }),
});

export const DeleteCal_boxSchema = z.object({
    params: z.object({
        cal_box_id: z.string(),
    }),
});