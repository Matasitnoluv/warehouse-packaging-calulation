import { v4 as uuidv4 } from "uuid";
import { shelfBoxStorageRepository } from "./shelfBoxStorageRepository";
import { msshelfRepository } from "../msshelf/msshelfRepository";

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

    checkExistingStorageAsync: async (document_product_no: string, master_shelf_id: string) => {
        try {
            // Check if there's any existing storage for this document product no
            const existingStorage = await shelfBoxStorageRepository.findByDocumentNoAsync(document_product_no);
            
            if (existingStorage.length > 0) {
                // Check if it's in the same shelf
                const sameShelf = existingStorage.some(storage => storage.master_shelf_id === master_shelf_id);
                
                if (sameShelf) {
                    // If same shelf, return true to indicate we need to delete existing records
                    return {
                        exists: true,
                        sameShelf: true,
                        existingRecords: existingStorage
                    };
                } else {
                    // If different shelf, return false since we can store in different warehouse
                    return {
                        exists: true,
                        sameShelf: false,
                        existingRecords: existingStorage
                    };
                }
            }
            
            return {
                exists: false,
                sameShelf: false,
                existingRecords: []
            };
        } catch (error: any) {
            throw new Error(`Error checking existing storage: ${error.message}`);
        }
    },

    createAsync: async (payload: any) => {
        try {
            // Check if the shelf exists
            const shelf = await msshelfRepository.findByIdAsync(payload.master_shelf_id);
            if (!shelf) {
                return {
                    success: false,
                    responseObject: null,
                    message: "Shelf not found",
                };
            }

            // Check for existing storage
            const existingStorageCheck = await shelfBoxStorageServices.checkExistingStorageAsync(
                payload.document_product_no,
                payload.master_shelf_id
            );

            console.log('Existing storage check:', existingStorageCheck);

            if (existingStorageCheck.exists) {
                if (existingStorageCheck.sameShelf) {
                    // If same shelf, delete existing records first
                    for (const record of existingStorageCheck.existingRecords) {
                        console.log('Attempting to delete record:', {
                            storage_id: record.storage_id,
                            document_product_no: record.document_product_no,
                            master_shelf_id: record.master_shelf_id
                        });

                        const deleteResult = await shelfBoxStorageRepository.deleteAsync(record.storage_id);
                        console.log('Delete existing boxes response:', {
                            storage_id: record.storage_id,
                            result: deleteResult
                        });

                        if (!deleteResult.success) {
                            console.error('Failed to delete record:', {
                                storage_id: record.storage_id,
                                error: deleteResult.message
                            });
                            throw new Error(deleteResult.message);
                        }
                    }
                } else {
                    // If different shelf, return error since we can't store the same document in different shelves
                    return {
                        success: false,
                        responseObject: null,
                        message: "This document product number already exists in a different shelf. Please remove it first.",
                    };
                }
            }

            // Check if there's enough space in the shelf
            const currentUsedVolume = await shelfBoxStorageRepository.getTotalVolumeByShelfIdAsync(payload.master_shelf_id);
            const totalVolumeToAdd = payload.cubic_centimeter_box * payload.count;
            
            // Set the total volume in the payload
            payload.total_volume = totalVolumeToAdd;

            if (currentUsedVolume + totalVolumeToAdd > shelf.cubic_centimeter_shelf!) {
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
                try {
                    // Check if the shelf exists
                    const shelf = await msshelfRepository.findByIdAsync(item.master_shelf_id);
                    if (!shelf) {
                        errors.push({
                            cal_box_id: item.cal_box_id,
                            message: "Shelf not found",
                        });
                        continue;
                    }

                    // Check for existing storage
                    const existingStorageCheck = await shelfBoxStorageServices.checkExistingStorageAsync(
                        item.document_product_no,
                        item.master_shelf_id
                    );

                    console.log('Existing storage check for', item.document_product_no, ':', existingStorageCheck);

                    if (existingStorageCheck.exists) {
                        if (existingStorageCheck.sameShelf) {
                            // If same shelf, delete existing records first
                            for (const record of existingStorageCheck.existingRecords) {
                                console.log('Attempting to delete record:', {
                                    storage_id: record.storage_id,
                                    document_product_no: record.document_product_no,
                                    master_shelf_id: record.master_shelf_id
                                });

                                const deleteResult = await shelfBoxStorageRepository.deleteAsync(record.storage_id);
                                console.log('Delete existing boxes response:', {
                                    storage_id: record.storage_id,
                                    result: deleteResult
                                });

                                if (!deleteResult.success) {
                                    console.error('Failed to delete record:', {
                                        storage_id: record.storage_id,
                                        error: deleteResult.message
                                    });
                                    errors.push({
                                        cal_box_id: item.cal_box_id,
                                        message: deleteResult.message,
                                    });
                                    continue;
                                }
                            }
                        } else {
                            // If different shelf, add to errors since we can't store the same document in different shelves
                            errors.push({
                                cal_box_id: item.cal_box_id,
                                message: "This document product number already exists in a different shelf. Please remove it first.",
                            });
                            continue;
                        }
                    }

                    // Check if there's enough space in the shelf
                    const currentUsedVolume = await shelfBoxStorageRepository.getTotalVolumeByShelfIdAsync(item.master_shelf_id);
                    const totalVolumeToAdd = item.cubic_centimeter_box * item.count;
                    
                    // Set the total volume in the payload
                    item.total_volume = totalVolumeToAdd;

                    if (currentUsedVolume + totalVolumeToAdd > shelf.cubic_centimeter_shelf!) {
                        errors.push({
                            cal_box_id: item.cal_box_id,
                            message: "Not enough space in the shelf",
                        });
                        continue;
                    }

                    // Generate a new UUID for the storage
                    const storage_id = uuidv4();
                    const newPayload = {
                        ...item,
                        storage_id,
                    };

                    // Create the storage record
                    const result = await shelfBoxStorageRepository.createAsync(newPayload);
                    results.push(result);
                } catch (error: any) {
                    errors.push({
                        cal_box_id: item.cal_box_id,
                        message: error.message,
                    });
                }
            }

            return {
                success: true,
                responseObject: {
                    successful: results,
                    failed: errors,
                },
                message: `Processed ${payload.length} boxes. ${results.length} boxes stored successfully. ${errors.length} boxes failed.`,
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
