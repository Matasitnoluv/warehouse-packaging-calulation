
export type TypeCalMsproductAll = {
    document_product_id: string;
    document_product_no: string;
    status: boolean;
    sort_by: number;
    calculation_type?: "single" | "mixed";
}

export type TypeCalMsproduct = {
    document_product_id: string;
    document_product_no: string;
    status: boolean;
    sort_by: number;
    calculation_type?: "single" | "mixed";
}

export type CalMsproductResponse = {
    success: boolean;
    message: string;
    responseObject: TypeCalMsproduct[];
    statusCode: number;
};
