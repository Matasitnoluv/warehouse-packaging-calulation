import { BoxInShelfType } from "./box_in_shelf_onstorageModel";
import { BoxInShelfRepository } from "./box_in_shelf_onstorageRepository";
import { ServiceResponse } from "@common/types/response";

export class BoxInShelfService {
    private repository: BoxInShelfRepository;

    constructor() {
        this.repository = new BoxInShelfRepository();
    }

    async create(payload: BoxInShelfType): Promise<ServiceResponse<any>> {
        try {
            const result = await this.repository.create(payload);
            if (!result.success) {
                return {
                    success: false,
                    message: result.error || "Failed to create box in shelf",
                    responseObject: null,
                    statusCode: 400
                };
            }

            return {
                success: true,
                message: "Successfully created box in shelf",
                responseObject: result.data,
                statusCode: 201
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to create box in shelf",
                responseObject: null,
                statusCode: 500
            };
        }
    }

    async findAll(): Promise<ServiceResponse<any>> {
        try {
            const result = await this.repository.findAll();
            if (!result.success) {
                return {
                    success: false,
                    message: result.error || "Failed to fetch shelves",
                    responseObject: null,
                    statusCode: 400
                };
            }

            return {
                success: true,
                message: "Successfully fetched all shelves",
                responseObject: result.data,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch shelves",
                responseObject: null,
                statusCode: 500
            };
        }
    }

    async findByShelfId(shelf_id: string): Promise<ServiceResponse<any>> {
        try {
            const result = await this.repository.findByShelfId(shelf_id);
            if (!result.success) {
                return {
                    success: false,
                    message: result.error || "Failed to fetch shelf",
                    responseObject: null,
                    statusCode: 400
                };
            }

            return {
                success: true,
                message: "Successfully fetched shelf",
                responseObject: result.data,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch shelf",
                responseObject: null,
                statusCode: 500
            };
        }
    }

    async update(shelf_id: string, payload: BoxInShelfType): Promise<ServiceResponse<any>> {
        try {
            const result = await this.repository.update(shelf_id, payload);
            if (!result.success) {
                return {
                    success: false,
                    message: result.error || "Failed to update box in shelf",
                    responseObject: null,
                    statusCode: 400
                };
            }

            return {
                success: true,
                message: "Successfully updated box in shelf",
                responseObject: result.data,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to update box in shelf",
                responseObject: null,
                statusCode: 500
            };
        }
    }

    async delete(shelf_id: string): Promise<ServiceResponse<any>> {
        try {
            const result = await this.repository.delete(shelf_id);
            if (!result.success) {
                return {
                    success: false,
                    message: result.error || "Failed to delete shelf",
                    responseObject: null,
                    statusCode: 400
                };
            }

            return {
                success: true,
                message: "Successfully deleted shelf",
                responseObject: null,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to delete shelf",
                responseObject: null,
                statusCode: 500
            };
        }
    }
}
