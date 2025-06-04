import { BoxInShelfType } from "./box_in_shelf_onstorageModel";
import prisma from "@src/db";

export class BoxInShelfRepository {
    async create(payload: BoxInShelfType) {
        try {
            // Create box storage records for each box
            const boxStorageRecords = await Promise.all(
                payload.fitBoxes.map(async (box) => {
                    return prisma.shelf_box_storage.create({
                        data: {
                            master_shelf_id: payload.master_shelf_id,
                            cal_box_id: box.cal_box_id,
                            document_product_no: box.document_product_no,
                            cubic_centimeter_box: box.cubic_centimeter_box,
                            count: box.count,
                            total_volume: box.total_volume,
                            document_warehouse_no: payload.document_warehouse_no,
                            status: "stored",
                        },
                    });
                })
            );

            // Update warehouse status
            await prisma.cal_warehouse.update({
                where: { document_warehouse_no: payload.document_warehouse_no },
                data: {
                    master_warehouse_id: payload.master_warehouse_id,
                },
            });

            return {
                success: true,
                data: {
                    boxStorageRecords,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create box in shelf",
            };
        }
    }


    async findAll() {
        try {
            const shelves = await prisma.shelf_box_storage.findMany({
                include: {
                    mastershelf: true,
                    cal_box: true,
                    cal_warehouse: true
                }
            });

            return {
                success: true,
                data: shelves
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch shelves"
            };
        }
    }

    async findByShelfId(shelf_id: string) {
        try {
            const shelf = await prisma.shelf_box_storage.findMany({
                where: { master_shelf_id: shelf_id },
                include: {
                    mastershelf: true,
                    cal_box: true,
                    cal_warehouse: true
                }
            });

            if (!shelf) {
                return {
                    success: false,
                    error: "Shelf not found"
                };
            }

            return {
                success: true,
                data: shelf
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch shelf"
            };
        }
    }

    async update(storage_id: string, payload: BoxInShelfType) {
        try {
            // Delete existing box storage records for this shelf
            await prisma.shelf_box_storage.deleteMany({
                where: { master_shelf_id: payload.master_shelf_id }
            });

            // Create new box storage records
            const boxStorageRecords = await Promise.all(
                payload.fitBoxes.map(async (box) => {
                    return prisma.shelf_box_storage.create({
                        data: {
                            master_shelf_id: payload.master_shelf_id,
                            cal_box_id: box.cal_box_id,
                            document_product_no: box.document_product_no,
                            cubic_centimeter_box: box.cubic_centimeter_box,
                            count: box.count,
                            total_volume: box.total_volume,
                            document_warehouse_no: payload.document_warehouse_no,
                            status: "stored"
                        }
                    });
                })
            );

            return {
                success: true,
                data: {
                    boxStorageRecords
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update box in shelf"
            };
        }
    }

    async delete(storage_id: string) {
        try {
            // Delete box storage records
            await prisma.shelf_box_storage.delete({
                where: { storage_id }
            });

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to delete shelf"
            };
        }
    }
}
