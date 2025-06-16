import { masterwarehouse } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadMsWarehouse } from "@modules/mswarehouse/mswarehouseModel";

export const Keys = [
    "master_warehouse_id",
    "master_warehouse_name",
    "height",
    "length",
    "width",
    "cubic_centimeter_warehouse",
    "description",
];

export const mswarehouseRepository = {
    findAllAsync: async () => {
        return prisma.masterwarehouse.findMany({
            select: {
                master_warehouse_id: true,
                master_warehouse_name: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_warehouse: true,
                description: true,
            },
        });
    },

    findById: async (master_warehouse_id: string) => {
        return prisma.masterwarehouse.findUnique({
            where: { master_warehouse_id },
        });
    },

    findByName: async <Key extends keyof masterwarehouse>(
        master_warehouse_name: string,
        keys = Keys as Key[]
    ): Promise<Pick<masterwarehouse, Key> | null> => {
        const selectedFields = keys.reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.masterwarehouse.findFirst({
            where: { master_warehouse_name: master_warehouse_name },
            select: selectedFields,
        })

        return result as Pick<masterwarehouse, Key> | null;
    },

    create: async (payload: TypePayloadMsWarehouse) => {
        const master_warehouse_name = payload.master_warehouse_name.trim();
        const setPayload: any = {
            master_warehouse_name: master_warehouse_name,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_warehouse: payload.cubic_centimeter_warehouse,
            description: payload.description,
        };

        return await prisma.masterwarehouse.create({
            data: setPayload,
        });
    },

    update: async (master_warehouse_id: string, payload: Partial<TypePayloadMsWarehouse>) => {
        const updatedPayload = {
            master_warehouse_name: payload.master_warehouse_name,
            height: payload.height,
            length: payload.length,
            width: payload.width,
            cubic_centimeter_warehouse: payload.cubic_centimeter_warehouse,
            description: payload.description
        };

        return await prisma.masterwarehouse.update({
            where: { master_warehouse_id },
            data: updatedPayload,
        });
    },

    delete: async (master_warehouse_id: string) => {
        return await prisma.masterwarehouse.delete({
            where: { master_warehouse_id: master_warehouse_id },
        });
    },
};