import { msshelfRepository } from "./msshelfRepository";

export const msshelfServices = {
    findAllAsync: async (master_rack_id?: string) => {
        try {
            const shelves = await msshelfRepository.findAllAsync(master_rack_id);
            return {
                success: true,
                message: "Shelves retrieved successfully",
                responseObject: shelves
            };
        } catch (error) {
            console.error("Error in msshelfServices.findAllAsync:", error);
            return {
                success: false,
                message: "Failed to retrieve shelves",
                responseObject: null
            };
        }
    },

    findByIdAsync: async (master_shelf_id: string) => {
        try {
            const shelf = await msshelfRepository.findByIdAsync(master_shelf_id);
            if (!shelf) {
                return {
                    success: false,
                    message: "Shelf not found",
                    responseObject: null
                };
            }
            return {
                success: true,
                message: "Shelf retrieved successfully",
                responseObject: shelf
            };
        } catch (error) {
            console.error("Error in msshelfServices.findByIdAsync:", error);
            return {
                success: false,
                message: "Failed to retrieve shelf",
                responseObject: null
            };
        }
    },

    createAsync: async (payload: any) => {
        try {
            const shelf = await msshelfRepository.createAsync(payload);
            return {
                success: true,
                message: "Shelf created successfully",
                responseObject: shelf
            };
        } catch (error) {
            console.error("Error in msshelfServices.createAsync:", error);
            return {
                success: false,
                message: "Failed to create shelf",
                responseObject: null
            };
        }
    },

    updateAsync: async (payload: any) => {
        try {
            const shelf = await msshelfRepository.updateAsync(payload);
            return {
                success: true,
                message: "Shelf updated successfully",
                responseObject: shelf
            };
        } catch (error) {
            console.error("Error in msshelfServices.updateAsync:", error);
            return {
                success: false,
                message: "Failed to update shelf",
                responseObject: null
            };
        }
    },

    deleteAsync: async (master_shelf_id: string) => {
        try {
            const shelf = await msshelfRepository.deleteAsync(master_shelf_id);
            return {
                success: true,
                message: "Shelf deleted successfully",
                responseObject: shelf
            };
        } catch (error) {
            console.error("Error in msshelfServices.deleteAsync:", error);
            return {
                success: false,
                message: "Failed to delete shelf",
                responseObject: null
            };
        }
    }
};
