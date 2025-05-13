import { masterrack } from "@prisma/client";
import prisma from "@src/db";

const MSRACK_SELECT_FIELDS = [
    "master_rack_id",
    "master_rack_name",
    "height",
    "length",
    "width",
    "cubic_centimeter_rack",
    "description",
    "master_zone_id",
];

export const msrackRepository = {
    findAllAsync: async (master_zone_id?: string) => {
        const whereClause = master_zone_id ? { master_zone_id } : {};
        
        return prisma.masterrack.findMany({
            where: whereClause,
            select: {
                master_rack_id: true,
                master_rack_name: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_rack: true,
                description: true,
                master_zone_id: true,
            },
        });
    },

    findByIdAsync: async (master_rack_id: string) => {
        return prisma.masterrack.findUnique({
            where: {
                master_rack_id,
            },
            select: {
                master_rack_id: true,
                master_rack_name: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_rack: true,
                description: true,
                master_zone_id: true,
            },
        });
    },

    createAsync: async (payload: any) => {
        const setPayload = {
            master_rack_id: payload.master_rack_id,
            master_rack_name: payload.master_rack_name,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_rack: payload.cubic_centimeter_rack,
            description: payload.description,
            master_zone_id: payload.master_zone_id,
        };

        return await prisma.masterrack.create({
            data: setPayload,
        });
    },

    updateAsync: async (payload: any) => {
        const setPayload = {
            master_rack_name: payload.master_rack_name,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_rack: payload.cubic_centimeter_rack,
            description: payload.description,
            master_zone_id: payload.master_zone_id,
        };

        return await prisma.masterrack.update({
            where: {
                master_rack_id: payload.master_rack_id,
            },
            data: setPayload,
        });
    },

    deleteAsync: async (master_rack_id: string) => {
        return await prisma.masterrack.delete({
            where: {
                master_rack_id,
            },
        });
    },
};