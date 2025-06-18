

export type TypeCalWarehouse = {
    cal_warehouse_id: string;
    document_warehouse_no: string;
    sort_by: number;
    master_warehouse_id: string;
    master_zone_id: string;
    cal_msproduct_id: string;

};

export type CalWarehouseResponse = {
    success: boolean;
    message: string;
    responseObject: TypeCalWarehouse[];
    statusCode: number;
};
