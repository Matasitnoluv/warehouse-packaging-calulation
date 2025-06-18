export type PayloadCreateCal_Warehouse = {
    document_warehouse_no: string;
    status: boolean;
    sort_by: number;
};

export type PayloadUpdateCal_Warehouse = {
    cal_warehouse_id: string;
    document_warehouse_no: string;
    master_warehouse_id?: string;
    sort_by?: number;
};

export type PayloadDeleteCal_Warehouse = {
    cal_warehouse_id: string;
};

