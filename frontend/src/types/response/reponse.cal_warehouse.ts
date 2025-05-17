export type TypeCalWarehouseAll = {
    document_warehouse_id: string;
    document_warehouse_no: string;
    status: boolean;
    sort_by: number;
};

export type TypeCalWarehouse = {
    document_warehouse_id: string;
    document_warehouse_no: string;
    sort_by: number;
};

export type CalWarehouseResponse = {
    success: boolean;
    message: string;
    responseObject: TypeCalWarehouse;
    statusCode: number;
};
