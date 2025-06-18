import { z } from "zod";

export type TypePayloadcal_msproduct = {
    document_product_id: string;
    document_product_no: string;
    status: boolean;
    sort_by: number;
};

export const CreateCal_msproductSchema = z.object({
    body: z.object({
        document_product_no: z.string(),
        status: z.boolean(),
        sort_by: z.number(),
    }),
});

export const UpdateCal_msproductSchema = z.object({
    body: z.object({
        document_product_no: z.string(),
        document_product_id: z.string(),
        sort_by: z.number(),
    }),
});

export const DeleteCal_msproductSchema = z.object({
    params: z.object({
        document_product_id: z.string(),
    }),
});