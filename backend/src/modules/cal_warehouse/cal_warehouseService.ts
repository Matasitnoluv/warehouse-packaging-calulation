import { cal_warehouseRepository } from "@modules/cal_warehouse/cal_warehouseRepository";
import { StatusCodes } from "http-status-codes";
import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { TypePayloadcal_warehouse } from "@modules/cal_warehouse/cal_warehouseModel";
import { cal_warehouse } from "@prisma/client";

export const cal_warehouseService = {
    findAll: async () => {
        const cal_warehouse = await cal_warehouseRepository.findAllAsync();
        return new ServiceResponse(
            ResponseStatus.Success,
            "Get All success",
            cal_warehouse,
            StatusCodes.OK
        );
    },

    findByDocumentWarehouseNo: async (document_warehouse_no: string) => {
        const cal_warehouse = await cal_warehouseRepository.findByDocumentWarehouseNo(document_warehouse_no);
        return new ServiceResponse(
            ResponseStatus.Success,
            "Get All success",
            cal_warehouse,
            StatusCodes.OK
        );
    },
    getEditWarehouse: async (id: string) => {
        const calWarehouse = await cal_warehouseRepository.findWarehoude(id);

        if (!calWarehouse) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Warehouse not found",
                null,
                StatusCodes.NOT_FOUND
            );
        }

        return new ServiceResponse(
            ResponseStatus.Success,
            "Edit",
            calWarehouse,
            StatusCodes.OK
        );
    },

    create: async (payload: TypePayloadcal_warehouse) => {
        try {
            const checkCal_warehouse = await cal_warehouseRepository.findByName(payload.document_warehouse_no);
            if (checkCal_warehouse) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Warehouse already taken",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }
            const cal_warehouse = await cal_warehouseRepository.create(payload);
            return new ServiceResponse<cal_warehouse>(
                ResponseStatus.Success,
                "Create cal_warehouse success",
                cal_warehouse,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error create warehouse :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    update: async (cal_warehouse_id: string, payload: TypePayloadcal_warehouse) => {
        try {
            const masterwarehouse = await cal_warehouseRepository.update(cal_warehouse_id, payload);
            return new ServiceResponse<cal_warehouse>(
                ResponseStatus.Success,
                "Update warehouse success",
                masterwarehouse,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error update warehouse :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    delete: async (cal_warehouse_id: string) => {
        try {
            await cal_warehouseRepository.delete(cal_warehouse_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete warehouse success",
                null,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error delete warehouse :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};