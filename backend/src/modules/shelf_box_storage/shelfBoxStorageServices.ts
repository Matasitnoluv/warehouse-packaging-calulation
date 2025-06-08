import { v4 as uuidv4 } from "uuid";
import { shelfBoxStorageRepository } from "./shelfBoxStorageRepository";
import { msshelfRepository } from "../msshelf/msshelfRepository";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const shelfBoxStorageServices = {
    getAllAsync: async () => {
        try {
            const data = await shelfBoxStorageRepository.findAllAsync();
            return {
                success: true,
                responseObject: data,
                message: "Get all shelf box storage successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },


    getShelfExportAsync: async ({ master_warehouse_id, master_zone_id }: { master_warehouse_id: string, master_zone_id: string }) => {

        try {
            const warehouse = await prisma.masterwarehouse.findUnique({
                where: {
                    master_warehouse_id: master_warehouse_id,
                }
            })
            const zone = await prisma.masterzone.findUnique({
                where: {
                    master_zone_id: master_zone_id,
                }
            });


            const racks = await prisma.masterrack.findMany({
                where: {
                    master_zone_id: master_zone_id,
                }
            });
            const rackIds = racks.map(rack => rack.master_rack_id);
            const shelfs = await prisma.mastershelf.findMany({
                where: {
                    master_rack_id: {
                        in: rackIds,
                    },
                },
            });

            const shelfBoxStorage = await prisma.shelf_box_storage.findMany({
                where: {
                    master_warehouse_id: master_warehouse_id,
                    master_zone_id: master_zone_id,
                }
            });

            const data = {
                warehouse,
                zone,
                racks,
                shelfs,
                shelfBoxStorage,
            }
            return {
                success: true,
                responseObject: data,
                message: "Get data export successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByDocumentWarehouseNoAsync: async (document_warehouse_no: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByDocumentWareHouse(document_warehouse_no);
            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by document warehouse number successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByShelfIdAsync: async (master_shelf_id: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByShelfIdAsync(master_shelf_id);
            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by shelf ID successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByDocumentNoAsync: async (document_product_no: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByDocumentNoAsync(document_product_no);

            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by document number successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByDocumentWareHouse: async (document_warehouse_no: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByDocumentWareHouse(document_warehouse_no);
            console.log('GetByDocumentWareHouse data:', data);
            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by document number successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },
    createAsync: async (payload: any) => {
        try {
            //console.log('CreateAsync payload:', payload);
            // Check if the shelf exists
            const shelf = await msshelfRepository.findByIdAsync(payload.master_shelf_id);
            if (!shelf) {
                return {
                    success: false,
                    responseObject: null,
                    message: "Shelf not found",
                };
            }

            // Check if there's enough space in the shelf
            const currentUsedVolume = await shelfBoxStorageRepository.getTotalVolumeByShelfIdAsync(payload.master_shelf_id);
            const totalVolumeToAdd = payload.cubic_centimeter_box;

            // Set the total volume in the payload
            payload.total_volume = totalVolumeToAdd;

            if (!shelf.cubic_centimeter_shelf) {
                return {
                    success: false,
                    responseObject: null,
                    message: "Shelf capacity is not available",
                };
            }

            if (currentUsedVolume + totalVolumeToAdd > shelf.cubic_centimeter_shelf) {
                return {
                    success: false,
                    responseObject: null,
                    message: "Not enough space in the shelf",
                };
            }

            // Generate a new UUID for the storage
            const storage_id = uuidv4();
            const newPayload = {
                ...payload,
                storage_id,
            };

            const data = await shelfBoxStorageRepository.createAsync(newPayload);
            return {
                success: true,
                responseObject: data,
                message: "Create shelf box storage successful",
            };
        } catch (error: any) {
            console.error('CreateAsync error:', error);
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    updateAsync: async (storage_id: string, payload: any) => {
        try {
            const data = await shelfBoxStorageRepository.updateAsync(storage_id, payload);
            return {
                success: true,
                responseObject: data,
                message: "Update shelf box storage successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    deleteAsync: async (storage_id: string) => {
        try {
            const data = await shelfBoxStorageRepository.deleteAsync(storage_id);
            return {
                success: true,
                responseObject: data,
                message: "Delete shelf box storage successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    // Store multiple boxes in a shelf
    storeMultipleBoxesAsync: async (payload: any[]) => {
        try {
            const results = [];
            const errors = [];

            // Process each box storage request
            for (const item of payload) {
                // Check if the shelf exists
                const shelf = await msshelfRepository.findByIdAsync(item.master_shelf_id);
                if (!shelf || !shelf.cubic_centimeter_shelf) {
                    errors.push({
                        cal_box_id: item.cal_box_id,
                        message: "Shelf not found or invalid shelf volume",
                    });
                    continue;
                }

                // For single box storage, we don't need to check volume since we're storing one box at a time
                // The volume check will be handled by the shelf capacity constraint
                const totalVolumeToAdd = item.cubic_centimeter_box; // Just use the box volume since count is 1

                // Generate a new UUID for the storage
                const storage_id = uuidv4();
                const newPayload = {
                    ...item,
                    storage_id,
                    total_volume: totalVolumeToAdd // Keep total_volume for backward compatibility
                };

                // Create the storage record
                const result = await shelfBoxStorageRepository.createAsync(newPayload);
                results.push(result);
            }

            return {
                success: true,
                responseObject: {
                    successful: results,
                    failed: errors,
                },
                message: `Stored ${results.length} boxes successfully. ${errors.length} boxes failed.`,
            };
        } catch (error) {
            console.error("Error storing multiple boxes:", error);
            throw error;
        }
    },

    getStoredBoxesByShelfIdAsync: async (master_shelf_id: string) => {
        try {
            const storedBoxes = await prisma.shelf_box_storage.findMany({
                where: {
                    master_shelf_id: { in: [master_shelf_id] }
                },
                include: {
                    cal_box: true,
                    mastershelf: true,
                }
            });

            return {
                success: true,
                responseObject: storedBoxes,
                message: "Get stored boxes by shelf ID successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getStoredBoxesByDocument: async (documentProductNo: string) => {
        try {
            const storedBoxes = await prisma.shelf_box_storage.findMany({
                where: { document_product_no: documentProductNo },
                include: { mastershelf: true, cal_box: true }
            });

            return {
                success: true,
                responseObject: storedBoxes,
                message: "Get stored boxes by document number successful",
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
