import { TypePayloadcal_warehouse } from "@modules/cal_warehouse/cal_warehouseModel";
import { cal_warehouse } from "@prisma/client";
import prisma from "@src/db";

export const Keys = [
    "cal_warehouse_id",
    "document_warehouse_no",
    "status",
    "sort_by",
];

export const cal_warehouseRepository = {
    findAllAsync: async () => {
        return prisma.cal_warehouse.findMany({
            select: {
                cal_warehouse_id: true,
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
            include: { masterwarehouse: true, masterzones: true }
        });
    },

    findWarehoude: async (id: string) => {
        try {
            return await prisma.cal_warehouse.findUnique({ where: { cal_warehouse_id: id }, include: { masterwarehouse: true, masterzones: true } })
        } catch {
            return null
        }

    },
    create: async (payload: TypePayloadcal_warehouse) => {
        const document_warehouse_no = payload.document_warehouse_no.trim();
        console.log(payload)
        const setPayload: any = {
            document_warehouse_no: document_warehouse_no,
            status: payload.status,
            sort_by: payload.sort_by,
        };

        return await prisma.cal_warehouse.create({
            data: setPayload,
        });
    },

    update: async (cal_warehouse_id: string, payload: Partial<TypePayloadcal_warehouse>) => {
        const updatedPayload = {
            ...payload, cal_warehouse_id: payload.cal_warehouse_id ? String(payload.cal_warehouse_id) : undefined,
        };

        return await prisma.cal_warehouse.update({
            where: { cal_warehouse_id: cal_warehouse_id },
            data: updatedPayload,
        });
    },
    delete: async (cal_warehouse_id: string) => {
        const cal_warehouse = await prisma.cal_warehouse.findUnique({
            where: {
                cal_warehouse_id: cal_warehouse_id,
            },
        });

        if (!cal_warehouse) {
            throw new Error(`Cal warehouse not found with id ${cal_warehouse_id}`);
        }

        // ✅ ดึงกล่องทั้งหมดที่อยู่ใน warehouse นี้ พร้อมข้อมูล cal_box ที่เชื่อมโยง
        const shelf_box_storage = await prisma.shelf_box_storage.findMany({
            where: {
                cal_warehouse_id: cal_warehouse.cal_warehouse_id,
            },
            include: {
                cal_box: {
                    select: {
                        document_product_id: true, // หรือเปลี่ยนเป็น document_product_no ถ้าใช้ตัวนั้นเป็น ref
                    },
                },
            },
        });

        // ✅ ดึงเฉพาะ document_product_id ที่มีข้อมูลจริง
        const document_product_ids = shelf_box_storage
            .map((storage) => storage.cal_box?.document_product_id)
            .filter((id): id is string => !!id); // remove null/undefined

        if (document_product_ids.length > 0) {
            await prisma.cal_msproduct.updateMany({
                where: {
                    document_product_id: { in: document_product_ids },
                },
                data: {
                    status: false,
                },
            });
        }

        // ✅ ลบ warehouse
        return await prisma.cal_warehouse.delete({
            where: { cal_warehouse_id: cal_warehouse_id },
        });
    }

};
