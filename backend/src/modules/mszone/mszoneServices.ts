import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { TypePayloadMsZone } from "@modules/mszone/mszoneModel";
import { StatusCodes } from "http-status-codes";
import { masterzone } from "@prisma/client";
import { mszoneRepository } from "@modules/mszone/mszoneRepository";

export const mszoneService = {
    findAll: async (master_warehouse_id?: string) => {
        const zones = await mszoneRepository.findAllAsync(master_warehouse_id);
        return new ServiceResponse(
            ResponseStatus.Success,
            "Get All Success",
            zones,
            StatusCodes.OK
        );
    },

    create: async (payload: TypePayloadMsZone) => {
        try {
            // Check if zone with same name exists in the same warehouse
            const checkmszone = await mszoneRepository.findByNameAndWarehouse(
                payload.master_zone_name,
                payload.master_warehouse_id
            );
            
            if (checkmszone) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Zone already exists in this warehouse",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }
            const masterzone = await mszoneRepository.create(payload);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Create Success",
                masterzone,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error creating zone: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (master_zone_id: string, payload: Partial<TypePayloadMsZone>) => {
        try {
            const masterzone = await mszoneRepository.update(master_zone_id, payload);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Update Success",
                masterzone,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error updating zone: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    delete: async (master_zone_id: string) => {
        try {
            const masterzone = await mszoneRepository.delete(master_zone_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete Success",
                masterzone,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error deleting zone: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
}