export type PayloadCreateMasterproduct = {
    master_product_name: string;
    code_product: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_product: number;
    description: string;
    sort_by: number;
    image_path: string;
};

export type PayloadUpdateMsproduct = {
    master_product_id: string;
    master_product_name: string;
    code_product: string;
    height: number;
    length: number;
    width: number;
    sort_by: number;
    cubic_centimeter_product: number;
    description: string;
    image_path: string;
};

export type PayloadDeteleMsproduct = {
    master_product_id: string;
};
