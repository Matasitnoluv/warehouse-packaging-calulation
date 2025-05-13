import prisma from "@src/db";

const MSSHELF_SELECT_FIELDS = [
    "master_shelf_id",
    "master_shelf_name",
    "shelf_level",
    "height",
    "length",
    "width",
    "cubic_centimeter_shelf",
    "description",
    "master_rack_id",
];

export const msshelfRepository = {
    findAllAsync: async (master_rack_id?: string) => {
        const whereClause = master_rack_id ? { master_rack_id } : {};
        
        return prisma.mastershelf.findMany({
            where: whereClause,
            select: {
                master_shelf_id: true,
                master_shelf_name: true,
                shelf_level: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_shelf: true,
                description: true,
                master_rack_id: true,
            },
            orderBy: {
                shelf_level: 'asc'
            }
        });
    },

    findByIdAsync: async (master_shelf_id: string) => {
        return prisma.mastershelf.findUnique({
            where: {
                master_shelf_id,
            },
            select: {
                master_shelf_id: true,
                master_shelf_name: true,
                shelf_level: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_shelf: true,
                description: true,
                master_rack_id: true,
            },
        });
    },

    createAsync: async (payload: any) => {
        const setPayload = {
            master_shelf_id: payload.master_shelf_id,
            master_shelf_name: payload.master_shelf_name,
            shelf_level: payload.shelf_level,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_shelf: payload.cubic_centimeter_shelf,
            description: payload.description,
            master_rack_id: payload.master_rack_id,
        };

        return await prisma.mastershelf.create({
            data: setPayload,
        });
    },

    updateAsync: async (payload: any) => {
        const setPayload = {
            master_shelf_name: payload.master_shelf_name,
            shelf_level: payload.shelf_level,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_shelf: payload.cubic_centimeter_shelf,
            description: payload.description,
            master_rack_id: payload.master_rack_id,
        };

        return await prisma.mastershelf.update({
            where: {
                master_shelf_id: payload.master_shelf_id,
            },
            data: setPayload,
        });
    },

    deleteAsync: async (master_shelf_id: string) => {
        return await prisma.mastershelf.delete({
            where: {
                master_shelf_id,
            },
        });
    },
};
