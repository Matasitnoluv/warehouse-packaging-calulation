import { TypePayloadcal_msproduct } from '@modules/cal_msproduct/cal_msproductModel';
import { cal_msproduct } from "@prisma/client";
import prisma from "@src/db";

export const Keys = [
    "document_product_id",
    "document_product_no",
    "status",
    "sort_by",
];

export const cal_msproductRepository = {
    findAllAsync: async () => {
        return prisma.cal_msproduct.findMany({
            select: {
                document_product_id: true,
                document_product_no: true,
                status: true,
                sort_by: true,
            },
        });
    },

    findByNo: async (document_product_no: string) => {
        return prisma.cal_msproduct.findMany({
            where: {
                document_product_no: document_product_no
            },

        });
    },

    findByName: async <Key extends keyof cal_msproduct>(
        document_product_no: string,
        keys = Keys as Key[]
    ): Promise<Pick<cal_msproduct, Key> | null> => {
        const selectedFields = keys.reduce(
            (obj, k) => ({ ...obj, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.cal_msproduct.findFirst({
            where: { document_product_no: document_product_no },
            select: selectedFields,
        });

        return result as Pick<cal_msproduct, Key> | null;
    },

    create: async (payload: TypePayloadcal_msproduct) => {
        const document_product_no = payload.document_product_no.trim();
        const setPayload: any = {
            document_product_no: document_product_no,
            status: payload.status,
            sort_by: payload.sort_by,
        };

        return await prisma.cal_msproduct.create({
            data: setPayload,
        });
    },

    update: async (document_product_id: string, payload: Partial<TypePayloadcal_msproduct>) => {
        const updatedPayload = {
            ...payload, document_product_id: payload.document_product_id ? String(payload.document_product_id) : undefined,
        };

        return await prisma.cal_msproduct.update({
            where: { document_product_id: document_product_id },
            data: updatedPayload,
        });
    },


    delete: async (document_product_id: string) => {
        return await prisma.cal_msproduct.delete({
            where: { document_product_id: document_product_id },
        })
    }
}