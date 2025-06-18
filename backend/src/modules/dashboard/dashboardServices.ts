import { mswarehouseRepository } from "../mswarehouse/mswarehouseRepository";
import { mszoneRepository } from "../mszone/mszoneRepository";
import { msrackRepository } from "../msrack/msrackRepository";
import { msshelfRepository } from "../msshelf/msshelfRepository";
import { shelfBoxStorageRepository } from "../shelf_box_storage/shelfBoxStorageRepository";

export const dashboardServices = {
    getDashboardOverview: async () => {
        try {
            // Get all warehouses
            const warehouses = await mswarehouseRepository.findAllAsync();
            
            // Get all zones
            const zones = await mszoneRepository.findAllAsync();
            
            // Get all racks
            const racks = await msrackRepository.findAllAsync();
            
            // Get all shelves
            const shelves = await msshelfRepository.findAllAsync();
            
            // Get all stored boxes
            const storedBoxes = await shelfBoxStorageRepository.findAllAsync();
            
            // Calculate totals and usage statistics
            const totalWarehouseVolume = warehouses.reduce((total, warehouse) => {
                return total + (warehouse.width_cm * warehouse.length_cm * warehouse.height_cm);
            }, 0);
            
            const totalZoneVolume = zones.reduce((total, zone) => {
                return total + (zone.width_cm * zone.length_cm * zone.height_cm);
            }, 0);
            
            const totalRackVolume = racks.reduce((total, rack) => {
                return total + (rack.width_cm * rack.length_cm * rack.height_cm);
            }, 0);
            
            const totalShelfVolume = shelves.reduce((total, shelf) => {
                return total + shelf.cubic_centimeter_shelf;
            }, 0);
            
            const totalUsedVolume = storedBoxes.reduce((total, box) => {
                return total + (box.total_volume || 0);
            }, 0);
            
            return {
                success: true,
                responseObject: {
                    warehouses,
                    zones,
                    racks,
                    shelves,
                    storedBoxes,
                    statistics: {
                        totalWarehouseVolume,
                        totalZoneVolume,
                        totalRackVolume,
                        totalShelfVolume,
                        totalUsedVolume,
                        remainingVolume: totalShelfVolume - totalUsedVolume,
                        usagePercentage: (totalUsedVolume / totalShelfVolume) * 100,
                    }
                },
                message: "Dashboard overview data retrieved successfully",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },
};