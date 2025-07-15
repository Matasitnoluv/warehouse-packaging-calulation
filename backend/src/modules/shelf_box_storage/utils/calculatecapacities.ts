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

export function calculateCapacitiesFromStoredBoxes(data: any) {
    const totalWarehouseVolume = data.cubic_centimeter_warehouse;
    let usedWarehouseVolume = 0;

    const allShelves: any[] = [];

    const zones = data.masterzone.map((zone: any) => {
        const totalZoneVolume = zone.cubic_centimeter_zone;
        let usedZoneVolume = 0;

        const racks = zone.racks.map((rack: any) => {
            const totalRackVolume = rack.cubic_centimeter_rack;
            let usedRackVolume = 0;

            const shelves = rack.shelves.map((shelf: any) => {
                const totalShelfVolume = shelf.cubic_centimeter_shelf;
                let usedShelfVolume = 0;

                shelf.stored_boxes.forEach((box: any) => {
                    usedShelfVolume += box.cubic_centimeter_box;
                });

                const remainShelf = totalShelfVolume - usedShelfVolume;

                const shelfData = {
                    shelfId: shelf.master_shelf_id,
                    rackId: rack.master_rack_id,
                    zoneId: zone.master_zone_id,
                    used: usedShelfVolume,
                    total: totalShelfVolume,
                    remain: remainShelf,
                    overUsed: remainShelf < 0,
                    name: shelf.master_shelf_name,
                };

                allShelves.push(shelfData);
                usedRackVolume += usedShelfVolume;

                return shelfData;
            });

            const remainRack = totalRackVolume - usedRackVolume;

            usedZoneVolume += usedRackVolume;

            return {
                rackId: rack.master_rack_id,
                zoneId: zone.master_zone_id,
                used: usedRackVolume,
                total: totalRackVolume,
                remain: remainRack,
                overUsed: remainRack < 0,
                shelves,
                name: rack.master_rack_name,
            };
        });

        const remainZone = totalZoneVolume - usedZoneVolume;

        usedWarehouseVolume += usedZoneVolume;

        return {
            zoneId: zone.master_zone_id,
            used: usedZoneVolume,
            total: totalZoneVolume,
            remain: remainZone,
            overUsed: remainZone < 0,
            racks,
            name: zone.master_zone_name,
        };
    });

    const remainWarehouse = totalWarehouseVolume - usedWarehouseVolume;

    return {
        warehouse: {
            warehouseId: data.master_warehouse_id,
            used: usedWarehouseVolume,
            total: totalWarehouseVolume,
            remain: remainWarehouse,
            overUsed: remainWarehouse < 0,
        },
        zones,
        shelves: allShelves,
    };
}


