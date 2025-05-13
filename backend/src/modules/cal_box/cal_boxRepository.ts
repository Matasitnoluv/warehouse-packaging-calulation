import { TypePayloadcal_box } from '@modules/cal_box/cal_boxModel';
import { cal_box } from "@prisma/client";
import prisma from "@src/db";

export const Keys = [
    "cal_box_id",
    "box_no",
    "master_box_name",
    "code_box",
    "master_product_name",
    "code_product",
    "cubic_centimeter_box",
    "count",
    "document_product_no",
];

export const cal_boxRepository = {
    findAllAsync: async () => {
        return prisma.cal_box.findMany({
            select: {
                cal_box_id: true,
                document_product_no: true,
                box_no: true,
                master_box_name: true,
                code_box: true,
                master_product_name: true,
                code_product: true,
                cubic_centimeter_box: true,
                count: true,
            },
        });
    },

    findByName: async <Key extends keyof cal_box>(
        master_box_name: string,
        keys = Keys as Key[]
    ): Promise<Pick<cal_box, Key> | null> => {
        const selectedFields = keys.reduce(
            (obj, k) => ({ ...obj, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.cal_box.findFirst({
            where: { master_box_name: master_box_name },
            select: selectedFields,
        });

        return result as Pick<cal_box, Key> | null;
    },

    findByDocumentProductNo: async (document_product_no: string) => {
        return prisma.cal_box.findMany({
            where: { 
                document_product_no: document_product_no 
            },
            select: {
                cal_box_id: true,
                document_product_no: true,
                box_no: true,
                master_box_name: true,
                code_box: true,
                master_product_name: true,
                code_product: true,
                cubic_centimeter_box: true,
                count: true,
            },
        });
    },

    create: async (payload: TypePayloadcal_box) => {
        const master_box_name = payload.master_box_name.trim();
        const setPayload: any = {
            master_box_name: master_box_name,
            box_no: payload.box_no,
            document_product_no: payload.document_product_no,
            code_box: payload.code_box,
            master_product_name: payload.master_product_name,
            code_product: payload.code_product,
            cubic_centimeter_box: payload.cubic_centimeter_box,
            count: payload.count,
        };

        return await prisma.cal_box.create({
            data: setPayload,
        });
    },

    update: async (cal_box_id: string, payload: Partial<TypePayloadcal_box>) => {
        const updatedPayload = {
            ...payload, cal_box_id: payload.cal_box_id ? String(payload.cal_box_id) : undefined,
        };

        return await prisma.cal_box.update({
            where: { cal_box_id: cal_box_id },
            data: updatedPayload,
        });
    },

    delete: async (cal_box_id: string) => {
        return await prisma.cal_box.delete({
            where: { cal_box_id: cal_box_id },
        })
    }
}