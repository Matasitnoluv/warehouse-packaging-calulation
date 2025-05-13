import { z } from "zod";

export type TypePayloadmasterproduct = {
    master_product_id: string;
    master_product_name: string;
    code_product: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_product: number;
    sort_by: number;
    description: string;
    image_path: string;
};

export const CreatMsproductSchema = z.object({
    body: z.object({
        master_product_name: z.string(),
        code_product: z.string(),
        height: z.number(),
        length: z.number(),
        width: z.number(),
        cubic_centimeter_product: z.number(),
        description: z.string(),
        image_path: z.string(),
    }),
});

export const UpdateMsproductSchema = z.object({
    body: z.object({
        master_product_name: z.string(),
        height: z.number(),
        length: z.number(),
        width: z.number(),
        cubic_centimeter_product: z.number(),
        description: z.string(),
        image_path: z.string(),
    }),
});

export const DeleteMsproductSchema = z.object({
    params: z.object({
        master_product_id: z.string(),
    }),
});

