// Types for Remaining Space data structure

export interface ShelfData {
    shelfId: string;
    rackId: string;
    zoneId: string;
    used: number;
    total: number;
    remain: number;
    overUsed: boolean;
    name: string;
}

export interface RackData {
    rackId: string;
    zoneId: string;
    used: number;
    total: number;
    remain: number;
    overUsed: boolean;
    shelves: ShelfData[];
    name: string;
}

export interface ZoneData {
    zoneId: string;
    used: number;
    total: number;
    remain: number;
    overUsed: boolean;
    racks: RackData[];
    name: string;
}

export interface WarehouseData {
    warehouseId: string;
    used: number;
    total: number;
    remain: number;
    overUsed: boolean;
}

export interface RemainingSpaceData {
    warehouse: WarehouseData;
    zones: ZoneData[];
    shelves: ShelfData[];
}

export interface RemainingSpaceResponse {
    success: boolean;
    responseObject: RemainingSpaceData | null;
    message: string;
} 