import { masterzone } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadMsZone } from "./mszoneModel";

export const Keys = [
    "master_zone_id",
    "master_zone_name",
    "height",
    "length",
    "width",
    "cubic_centimeter_zone",
    "description",
    "master_warehouse_id",
];

export const mszoneRepository = {
    findAllAsync: async (master_warehouse_id?: string) => {
        const whereClause = master_warehouse_id ? { master_warehouse_id } : {};
        
        return prisma.masterzone.findMany({
            where: whereClause,
            select: {
                master_zone_id: true,
                master_zone_name: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_zone: true,
                description: true,
                master_warehouse_id: true,
            },
        });
    },

    findByNameAndWarehouse: async <Key extends keyof masterzone>(
        master_zone_name: string,
        master_warehouse_id: string,
        keys = Keys as Key[]
    ): Promise<Pick<masterzone, Key> | null> => {
        const selectedFields = keys.reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.masterzone.findFirst({
            where: { 
                master_zone_name: master_zone_name,
                master_warehouse_id: master_warehouse_id 
            },
            select: selectedFields,
        })

        return result as Pick<masterzone, Key> | null;
    },

    findByName: async <Key extends keyof masterzone>(
        master_zone_name: string,
        keys = Keys as Key[]
    ): Promise<Pick<masterzone, Key> | null> => {
        const selectedFields = keys.reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.masterzone.findFirst({
            where: { master_zone_name: master_zone_name },
            select: selectedFields,
        })

        return result as Pick<masterzone, Key> | null;
    },

    create: async (payload: TypePayloadMsZone) => {
        const master_zone_name = payload.master_zone_name.trim();
        const setPayload: any = {
            master_zone_name: master_zone_name,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_zone: payload.cubic_centimeter_zone,
            description: payload.description,
            master_warehouse_id: payload.master_warehouse_id,
        };

        return await prisma.masterzone.create({
            data: setPayload,
        });
    },

    update: async (master_zone_id: string, payload: Partial<TypePayloadMsZone>) => {
        const updatedPayload = {
            master_zone_name: payload.master_zone_name,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_zone: payload.cubic_centimeter_zone,
            description: payload.description,
            master_warehouse_id: payload.master_warehouse_id,
        };

        return await prisma.masterzone.update({
            where: { master_zone_id },
            data: updatedPayload,
        });
    },

    delete: async (master_zone_id: string) => {
        return await prisma.masterzone.delete({
            where: { master_zone_id: master_zone_id },
        });
    },
};