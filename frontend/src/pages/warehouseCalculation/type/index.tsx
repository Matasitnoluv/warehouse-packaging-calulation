// Define types
export interface WarehouseType {
    master_warehouse_id: string;
    master_warehouse_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_warehouse: number;
    description: string;
}

export interface ZoneType {
    master_zone_id: string;
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
    master_warehouse_id: string;
}

export interface RackType {
    master_rack_id: string;
    master_rack_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_rack: number;
    description: string;
    master_zone_id: string;
}

export interface ShelfType {
    master_shelf_id: string;
    master_shelf_name: string;
    shelf_level: number;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_shelf: number;
    description: string;
    master_rack_id: string;
}

export interface DocumentTypeCalculate {
    document_product_id: string;
    document_product_no: string;
    status: boolean;
    status_date: string;
    status_by: string;
    create_by: string;
    create_date: string;
    update_by: string;
    update_date: string;
    sort_by: number;
    master_box_id: string;
    master_product_id: string;
}

export interface BoxType {
    cal_box_id: string;
    box_no: number;
    master_box_name: string;
    code_box: string;
    master_product_name: string;
    code_product: string;
    cubic_centimeter_box: number;
    count: number;
    document_product_no: string;
}

export interface BoxFitResult {
    box: BoxType;
    fits: boolean;
    isStored: boolean;
    isStoredAnywhere: boolean;
    remainingSpace: number;
}

export interface RackSpaceSummary {
    totalRackVolume: number;
    usedVolume: number;
    remainingVolume: number;
    usagePercentage: number;
    fittingBoxes: number;
    totalBoxes: number;
}

export interface StoredBoxType {
    storage_id: string;
    master_rack_id: string;
    cal_box_id: string;
    stored_date: string;
    stored_by?: string | null;
    position?: number | null;
    status: string;
    // New fields for volume information
    cubic_centimeter_box?: number;
    count?: number;
    total_volume?: number;
    document_product_no?: string;
    // Box relationship fields
    box?: {
        cal_box_id: string;
        box_no?: number;
        master_box_name?: string;
        code_box?: string;
        master_product_name?: string;
        code_product?: string;
        cubic_centimeter_box?: number;
        count?: number;
        document_product_no?: string;
    }
    // Flattened box fields
    box_no?: number;
    master_box_name?: string;
    code_box?: string;
    master_product_name?: string;
    code_product?: string;
};

export interface ShelfStoredBoxType {
    storage_id: string;
    master_shelf_id: string;
    cal_box_id: string;
    stored_date: string;
    stored_by?: string | null;
    position?: number | null;
    status: string;
    // Volume information
    cubic_centimeter_box?: number;
    count?: number;
    total_volume?: number;
    document_product_no?: string;
    // Box relationship fields
    box?: {
        cal_box_id: string;
        box_no?: number;
        master_box_name?: string;
        code_box?: string;
        master_product_name?: string;
        code_product?: string;
        cubic_centimeter_box?: number;
        count?: number;
        document_product_no?: string;
    }
    // Shelf relationship fields
    shelf?: {
        master_shelf_id: string;
        master_shelf_name: string;
        shelf_level: number;
        cubic_centimeter_shelf: number;
    }
    // Flattened box fields
    box_no?: number;
    master_box_name?: string;
    code_box?: string;
    master_product_name?: string;
    code_product?: string;
};

export interface RackBoxStorage {
    storage_id: string;
    master_rack_id: string;
    cal_box_id: string;
    stored_date: string;
    stored_by?: string | null;
    position?: number | null;
    status: string;
    document_product_no?: string;
    cubic_centimeter_box?: number;
    count?: number;
    total_volume?: number;
    box?: {
        cal_box_id: string;
        box_no?: number;
        master_box_name?: string;
        code_box?: string;
        master_product_name?: string;
        code_product?: string;
        cubic_centimeter_box?: number;
        count?: number;
        document_product_no?: string;
    };
}


export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    responseObject: T;
}

// Add new export interface for box placement
export interface BoxPlacement {
    box: BoxType;
    suggestedShelf?: ShelfType;
    suggestedRack?: RackType;
    volume: number;
    canFit: boolean;
}

export type FitBox = {
    document_product_no: string;
    box_no: string | number;
    cubic_centimeter_box: number;
    cal_box_id: string;
    count: number;
};

export type ShelfWithFitBoxes = {
    shelf_id: string;
    shelf_name: string;
    master_rack_id: string;
    fitBoxes: FitBox[];
};

export type CalculateSummary = {
    zone: string;
    document: string;
    racks: RackType[];
    boxPlacements?: BoxPlacement[];
    shelves: ShelfType[];
};


export type DocumentWarehouseType = {
    document_warehouse_id: string;
    document_warehouse_no: string;
    master_warehouse_id: string;
    status: boolean;
    sort_by: number;
}