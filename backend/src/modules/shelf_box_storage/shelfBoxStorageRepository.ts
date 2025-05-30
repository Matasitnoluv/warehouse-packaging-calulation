import prisma from "@src/db";

const SHELF_BOX_STORAGE_SELECT_FIELDS = [
    "storage_id",
    "master_shelf_id",
    "cal_box_id",
    "stored_date",
    "stored_by",
    "position",
    "status",
    "cubic_centimeter_box",
    "count",
    "total_volume",
    "document_product_no",
];

export const shelfBoxStorageRepository = {
    findAllAsync: async () => {
        return prisma.shelf_box_storage.findMany({
            select: {
                storage_id: true,
                master_shelf_id: true,
                cal_box_id: true,
                stored_date: true,
                stored_by: true,
                position: true,
                status: true,
                cubic_centimeter_box: true,
                count: true,
                total_volume: true,
                document_product_no: true,
                box: {
                    select: {
                        cal_box_id: true,
                        box_no: true,
                        master_box_name: true,
                        code_box: true,
                        master_product_name: true,
                        code_product: true,
                        cubic_centimeter_box: true,
                        count: true,
                        document_product_no: true,
                    },
                },
                shelf: {
                    select: {
                        master_shelf_id: true,
                        master_shelf_name: true,
                        shelf_level: true,
                        height: true,
                        width: true,
                        length: true,
                        cubic_centimeter_shelf: true,
                    },
                },
            },
        });
    },

    findByShelfIdAsync: async (master_shelf_id: string) => {
        return prisma.shelf_box_storage.findMany({
            where: {
                master_shelf_id,
            },
            select: {
                storage_id: true,
                master_shelf_id: true,
                cal_box_id: true,
                stored_date: true,
                stored_by: true,
                position: true,
                status: true,
                cubic_centimeter_box: true,
                count: true,
                total_volume: true,
                document_product_no: true,
                box: {
                    select: {
                        cal_box_id: true,
                        box_no: true,
                        master_box_name: true,
                        code_box: true,
                        master_product_name: true,
                        code_product: true,
                        cubic_centimeter_box: true,
                        count: true,
                        document_product_no: true,
                    },
                },
            },
        });
    },

    findByDocumentNoAsync: async (document_product_no: string) => {
        return prisma.shelf_box_storage.findMany({
            where: {
                document_product_no,
            },
            select: {
                storage_id: true,
                master_shelf_id: true,
                cal_box_id: true,
                stored_date: true,
                stored_by: true,
                position: true,
                status: true,
                cubic_centimeter_box: true,
                count: true,
                total_volume: true,
                document_product_no: true,
                box: {
                    select: {
                        cal_box_id: true,
                        box_no: true,
                        master_box_name: true,
                        code_box: true,
                        master_product_name: true,
                        code_product: true,
                        cubic_centimeter_box: true,
                        count: true,
                        document_product_no: true,
                    },
                },
                shelf: {
                    select: {
                        master_shelf_id: true,
                        master_shelf_name: true,
                        shelf_level: true,
                        height: true,
                        width: true,
                        length: true,
                        cubic_centimeter_shelf: true,
                    },
                },
            },
        });
    },

    createAsync: async (payload: any) => {
        return prisma.shelf_box_storage.create({
            data: {
                master_shelf_id: payload.master_shelf_id,
                cal_box_id: payload.cal_box_id,
                stored_by: payload.stored_by,
                position: payload.position,
                status: payload.status || "stored",
                cubic_centimeter_box: payload.cubic_centimeter_box,
                count: payload.count,
                total_volume: payload.total_volume,
                document_product_no: payload.document_product_no,
            },
        });
    },

    updateAsync: async (storage_id: string, payload: any) => {
        return prisma.shelf_box_storage.update({
            where: {
                storage_id,
            },
            data: {
                master_shelf_id: payload.master_shelf_id,
                cal_box_id: payload.cal_box_id,
                stored_by: payload.stored_by,
                position: payload.position,
                status: payload.status,
                cubic_centimeter_box: payload.cubic_centimeter_box,
                count: payload.count,
                total_volume: payload.total_volume,
                document_product_no: payload.document_product_no,
            },
        });
    },

    deleteAsync: async (storage_id: string) => {
        return prisma.shelf_box_storage.delete({
            where: {
                storage_id,
            },
        });
    },

    // Get the total volume of boxes stored in a shelf
    getTotalVolumeByShelfIdAsync: async (master_shelf_id: string) => {
        const result = await prisma.shelf_box_storage.aggregate({
            where: {
                master_shelf_id,
                status: "stored", // Only count boxes that are still stored
            },
            _sum: {
                total_volume: true,
            },
        });

        return result._sum.total_volume || 0;
    },
};
