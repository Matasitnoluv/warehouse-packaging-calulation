import { cal_boxRepository } from '@modules/cal_box/cal_boxRepository';
import { StatusCodes } from "http-status-codes";
import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { TypePayloadcal_box } from '@modules/cal_box/cal_boxModel';
import { cal_box } from '@prisma/client';

export const cal_boxService = {
    findAll: async () => {
        const cal_box = await cal_boxRepository.findAllAsync();
        return new ServiceResponse(
            ResponseStatus.Success,
            "Get All success",
            cal_box,
            StatusCodes.OK
        );
    },
    
    findByDocumentProductNo: async (document_product_no: string) => {
        try {
            // If document_product_no is empty, return all boxes
            if (!document_product_no) {
                return await cal_boxService.findAll();
            }
            
            const cal_box = await cal_boxRepository.findByDocumentProductNo(document_product_no);
            return new ServiceResponse(
                ResponseStatus.Success,
                `Get boxes for document ${document_product_no} success`,
                cal_box,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error getting boxes by document: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    
    create: async (payload: TypePayloadcal_box) => {
        try {
            const checkCal_box = await cal_boxRepository.findByName(payload.master_box_name);
            // if (!checkCal_box) {
            //     return new ServiceResponse(
            //         ResponseStatus.Failed,
            //         "Cal_box already taken",
            //         null,
            //         StatusCodes.BAD_REQUEST
            //     );
            // }
            const cal_box = await cal_boxRepository.create(payload);
            return new ServiceResponse<cal_box>(
                ResponseStatus.Success,
                "Create cal_box success",
                cal_box,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error create masterbox :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (cal_box_id: string, payload: Partial<TypePayloadcal_box>) => {
        try {
            const cal_box = await cal_boxRepository.update(cal_box_id, payload);
            return new ServiceResponse<cal_box>(
                ResponseStatus.Success,
                "Update box success",
                cal_box,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error update product :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    delete: async (cal_box_id: string) => {
        try {
            await cal_boxRepository.delete(cal_box_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete Box success",
                null,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Delete Box :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};
