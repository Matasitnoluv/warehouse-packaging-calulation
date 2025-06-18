import { msrackRepository } from "./msrackRepository";

export const msrackServices = {
    findAll: async (master_zone_id?: string) => {
        try {
            const result = await msrackRepository.findAllAsync(master_zone_id);
            return {
                success: true,
                message: "Get All Success",
                responseObject: result,
                statusCode: 200,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                responseObject: null,
                statusCode: 500,
            };
        }
    },

    findById: async (master_rack_id: string) => {
        try {
            const result = await msrackRepository.findByIdAsync(master_rack_id);
            return {
                success: true,
                message: "Get By Id Success",
                responseObject: result,
                statusCode: 200,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                responseObject: null,
                statusCode: 500,
            };
        }
    },

    create: async (payload: any) => {
        try {
            const result = await msrackRepository.createAsync(payload);
            return {
                success: true,
                message: "Create Success",
                responseObject: result,
                statusCode: 201,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                responseObject: null,
                statusCode: 500,
            };
        }
    },

    update: async (payload: any) => {
        try {
            const result = await msrackRepository.updateAsync(payload);
            return {
                success: true,
                message: "Update Success",
                responseObject: result,
                statusCode: 200,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                responseObject: null,
                statusCode: 500,
            };
        }
    },

    delete: async (master_rack_id: string) => {
        try {
            const result = await msrackRepository.deleteAsync(master_rack_id);
            return {
                success: true,
                message: "Delete Success",
                responseObject: result,
                statusCode: 200,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                responseObject: null,
                statusCode: 500,
            };
        }
    },
};