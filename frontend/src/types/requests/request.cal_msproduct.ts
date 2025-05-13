export type PayloadCreateCalMasterproduct = {
    document_product_id: string;
    document_product_no: string;
    status: boolean;
    sort_by: number;
    calculation_type?: "single" | "mixed";
};

export type PayloadUpdateCalMsproduct = {
    document_product_no: string;
    document_product_id: string;
    sort_by: number;
};

export type PayloadDeteleCalMsproduct = {
    document_product_id: string;
};
