import { rack_box_storageRepository } from '@modules/rack_box_storage/rack_box_storageRepository';
import { StatusCodes } from "http-status-codes";
import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { TypePayloadRackBoxStorage } from '@modules/rack_box_storage/rack_box_storageModel';
import prisma from "@src/db";

export const rack_box_storageService = {
    // Get all stored boxes
    findAll: async () => {
        const storedBoxes = await rack_box_storageRepository.findAllAsync();
        return new ServiceResponse(
            ResponseStatus.Success,
            "Get all stored boxes success",
            storedBoxes,
            StatusCodes.OK
        );
    },

    // Get boxes stored in a specific rack
    findByRackId: async (master_rack_id: string) => {
        try {
            const storedBoxes = await rack_box_storageRepository.findByRackIdAsync(master_rack_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get stored boxes by rack success",
                storedBoxes,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error getting stored boxes by rack: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // Get details of a specific stored box
    findById: async (storage_id: string) => {
        try {
            const storedBox = await rack_box_storageRepository.findByIdAsync(storage_id);
            if (!storedBox) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Stored box not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get stored box success",
                storedBox,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error getting stored box: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // Store a box in a rack
    create: async (payload: TypePayloadRackBoxStorage) => {
        try {
            // Check if box is already stored in a rack
            const isBoxStored = await rack_box_storageRepository.isBoxStoredAsync(payload.cal_box_id);
            if (isBoxStored) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Box is already stored in a rack",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }

            // Get the rack details to check available space
            const rack = await prisma.masterrack.findUnique({
                where: { master_rack_id: payload.master_rack_id }
            });
            
            if (!rack || !rack.cubic_centimeter_rack) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Rack not found or has no volume information",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }

            // Get the box details to check its volume
            const box = await prisma.cal_box.findUnique({
                where: { cal_box_id: payload.cal_box_id }
            });
            
            if (!box || !box.cubic_centimeter_box || !box.count) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Box not found or has no volume information",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }

            // Calculate the current used volume in the rack
            const usedVolume = await rack_box_storageRepository.calculateUsedVolumeAsync(payload.master_rack_id);
            
            // Calculate the volume of the box to be added
            const boxVolume = box.cubic_centimeter_box * box.count;
            
            // Check if there's enough space in the rack
            if (usedVolume + boxVolume > rack.cubic_centimeter_rack) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Not enough space in the rack to store this box",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }

            // Store the box in the rack
            const storedBox = await rack_box_storageRepository.createAsync(payload);
            
            if (!storedBox) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Failed to store box in rack",
                    null,
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Box stored in rack successfully",
                storedBox,
                StatusCodes.OK
            );
        } catch (ex) {
            console.error("Error storing box in rack:", ex);
            const errorMessage = "Error storing box in rack: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // Update a stored box (change status or position)
    update: async (storage_id: string, payload: any) => {
        try {
            // Check if the stored box exists
            const storedBox = await rack_box_storageRepository.findByIdAsync(storage_id);
            if (!storedBox) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Stored box not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }

            // Update the stored box
            const updatedStoredBox = await rack_box_storageRepository.updateAsync(storage_id, payload);
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Stored box updated successfully",
                updatedStoredBox,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error updating stored box: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // Delete a stored box record
    delete: async (storage_id: string) => {
        try {
            // Check if the stored box exists
            const storedBox = await rack_box_storageRepository.findByIdAsync(storage_id);
            if (!storedBox) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Stored box not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }

            // Delete the stored box
            await rack_box_storageRepository.deleteAsync(storage_id);
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Stored box deleted successfully",
                null,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error deleting stored box: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};
