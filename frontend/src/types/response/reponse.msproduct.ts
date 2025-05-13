
export type TypeMsproductAll = {
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
    responseObject: TypeMsproduct;
    statusCode: number;
};
