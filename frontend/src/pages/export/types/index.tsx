
export interface StoredBox {
    storage_id: string;
    master_rack_id: string;
    master_rack_name: string;
    master_zone_name: string;
    master_warehouse_name: string;
    cal_box_id: string;
    stored_date: string;
    stored_by: string | null;
    position: number | null;
    status: string;
    document_product_no: string;
    cubic_centimeter_box: number;
    count: number;
    total_volume: number;
    box_no: number;
    master_box_name: string;
    master_product_name: string;
}

// Interface for grouped documents
export interface DocumentGroup {
    document_product_no: string;
    boxes: StoredBox[];
    boxCount: number;
    warehouse: string;
    zone: string;
    rack: string;
    stored_date: string;
}

export interface ExportLog {
    export_id: string;
    box_no: string;
    master_product_name: string;
    master_rack_name: string;
    master_zone_name: string;
    master_warehouse_name: string;
    customer_name: string;
    export_date: string;
    export_customer_address?: string;
    export_note?: string;
}