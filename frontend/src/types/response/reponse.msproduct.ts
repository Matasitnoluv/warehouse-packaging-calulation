export type TypeMsproductAll = {
    master_product_id: string;
    master_product_name: string;
    code_product: string;
    scale_product: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_product: number;
    count?: number;
    description?: string;
    image_path?: string;
    sort_by?: number;
}

export type TypeMsproduct = {
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
}

export type MsproductResponse = {
    success: boolean;
    message: string;
    responseObject: TypeMsproduct[];
    statusCode: number;
};


import { z } from "zod";
import { TypeMsbox } from "./reponse.msbox";
import { TypeCalBox } from "./reponse.cal_box";
import { TypeMswarehouse } from "./reponse.mswarehouse";
import { TypeMszone } from "./reponse.mszone";
import { TypeMsrack } from "./reponse.msrack";
import { TypeMsshelfAll } from "./reponse.msshelf";

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
    storage_id: string;
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
    master_warehouse_id?: string | null;
    master_zone_id?: string | null;
    export?: boolean;
    export_date?: Date;
};

export type TypeShelfExport = {
    warehouse: TypeMswarehouse;
    zone: TypeMszone;
    racks: TypeMsrack[];
    shelfs: TypeMsshelfAll[];
    shelfBoxStorage: TypeShelfBoxStorage[];
};



export type ZTypeShelfBoxStorage = z.infer<typeof shelfBoxStorageSchema>;