import { TypePayloadcal_warehouse } from "@modules/cal_warehouse/cal_warehouseModel";
import { cal_warehouse } from "@prisma/client";
import prisma from "@src/db";

export const Keys = [
    "document_warehouse_id",
    "document_warehouse_no",
    "status",
    "sort_by",
];

export const cal_warehouseRepository = {
    findAllAsync: async () => {
        return prisma.cal_warehouse.findMany({
            select: {
                document_warehouse_id: true,
                document_warehouse_no: true,
                status: true,
                sort_by: true,
                master_warehouse_id: true,
            },
        });
    },

    findByName: async <Key extends keyof cal_warehouse>(
        document_warehouse_no: string,
        keys = Keys as Key[]
    ): Promise<Pick<cal_warehouse, Key> | null> => {
        const selectedFields = keys.reduce(
            (obj, k) => ({ ...obj, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.cal_warehouse.findFirst({
            where: { document_warehouse_no: document_warehouse_no },
            select: selectedFields,
        });

        return result as Pick<cal_warehouse, Key> | null;
    },


    findByDocumentWarehouseNo: async (document_warehouse_no: string) => {
        return prisma.cal_warehouse.findMany({
            where: { document_warehouse_no: document_warehouse_no },
        });
    },

    create: async (payload: TypePayloadcal_warehouse) => {
        const document_warehouse_no = payload.document_warehouse_no.trim();
        const setPayload: any = {
            document_warehouse_no: document_warehouse_no,
            status: payload.status,
            sort_by: payload.sort_by,
        };

        return await prisma.cal_warehouse.create({
            data: setPayload,
        });
    },

    update: async (document_warehouse_id: string, payload: Partial<TypePayloadcal_warehouse>) => {
        const updatedPayload = {
            ...payload, document_warehouse_id: payload.document_warehouse_id ? String(payload.document_warehouse_id) : undefined,
        };

        return await prisma.cal_warehouse.update({
            where: { document_warehouse_id: document_warehouse_id },
            data: updatedPayload,
        });
    },

    delete: async (document_warehouse_id: string) => {
        return await prisma.cal_warehouse.delete({
            where: { document_warehouse_id: document_warehouse_id },
        });
    },
};
