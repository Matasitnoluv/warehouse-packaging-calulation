import { masterproduct } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadmasterproduct } from "@modules/msproduct/msproductModel";

export const Keys = [
    "master_product_id",
    "master_product_name",
    "code_product",
    "height",
    "length",
    "width",
    "cubic_centimeter_product",
    "description",
    "image_path",
];

export const msproductRepository = {
    findAllAsync: async () => {
        return prisma.masterproduct.findMany({
            select: {
                master_product_id: true,
                master_product_name: true,
                code_product: true,
                height: true,
                length: true,
                width: true,
                cubic_centimeter_product: true,
                description: true,
                image_path: true,
            },
        });
    },

    findByName: async <Key extends keyof masterproduct>(
        master_product_name: string,
        keys = Keys as Key[]
    ): Promise<Pick<masterproduct, Key> | null> => {
        const selectedFields = keys.reduce(
            (obj, k) => ({ ...obj, [k]: true }),
            {} as Record<Key, true>
        );

        const result = await prisma.masterproduct.findFirst({
            where: { master_product_name: master_product_name },
            select: selectedFields,
        });

        return result as Pick<masterproduct, Key> | null;
    },

    create: async (payload: TypePayloadmasterproduct) => {
        const master_product_name = payload.master_product_name.trim();
        const setPayload = {
            master_product_name: master_product_name,
            code_product: payload.code_product,
            height: Number(payload.height),
            length: Number(payload.length),
            width: Number(payload.width),
            cubic_centimeter_product: Number(payload.cubic_centimeter_product),
            description: payload.description,
            image_path: payload.image_path,
        };

        return await prisma.masterproduct.create({
            data: setPayload,
        });
    },

    update: async (master_product_id: string, payload: Partial<TypePayloadmasterproduct>) => {
        const updatedPayload = {
            master_product_name: payload.master_product_name,
            code_product: payload.code_product,
            height: payload.height ? Number(payload.height) : undefined,
            length: payload.length ? Number(payload.length) : undefined,
            width: payload.width ? Number(payload.width) : undefined,
            cubic_centimeter_product: payload.cubic_centimeter_product ? Number(payload.cubic_centimeter_product) : undefined,
            description: payload.description,
            sort_by: payload.sort_by ? Number(payload.sort_by) : undefined,
            image_path: payload.image_path
        };

        // Remove undefined values from payload
        const cleanedPayload = Object.fromEntries(
            Object.entries(updatedPayload).filter(([_, value]) => value !== undefined)
        );

        return await prisma.masterproduct.update({
            where: { master_product_id: master_product_id },
            data: cleanedPayload,
        });
    },

    delete: async (mater_product_id: string) => {
        return await prisma.masterproduct.delete({
            where: { master_product_id: mater_product_id },
        });
    },
};