export type PayloadCreateCalBox = {
    document_product_no: string;
    box_no: number;
    master_box_name: string;
    code_box: string;
    master_product_name: string;
    code_product: string;
    cubic_centimeter_box: number;
    count: number;
};

export type PayloadUpdateCalBox = {
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

export type PayloadDeteleCalBox = {
    cal_box_id: string;
};