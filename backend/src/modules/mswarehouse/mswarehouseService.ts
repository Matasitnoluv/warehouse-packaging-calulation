import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { TypePayloadMsWarehouse } from "@modules/mswarehouse/mswarehouseModel";
import { StatusCodes } from "http-status-codes";
import { masterwarehouse } from "@prisma/client";
import { mswarehouseRepository } from "@modules/mswarehouse/mswarehouseRepository";
import prisma from "@src/db";

// อินเตอร์เฟสสำหรับข้อมูลการใช้พื้นที่ของ warehouse
interface WarehouseUsage {
    master_warehouse_id: string;
    master_warehouse_name: string;
    total_volume: number; // พื้นที่ทั้งหมดของ warehouse
    used_by_zones: number; // พื้นที่ที่ถูกใช้ไปในการสร้าง Zone
    used_by_boxes: number; // พื้นที่ที่ถูกใช้ไปในการเก็บของใน rack
    available_space: number; // พื้นที่ที่ยังเหลือ
    usage_percentage: number; // เปอร์เซ็นต์การใช้พื้นที่
    width: number;
    length: number;
    height: number;
    description?: string;
}

export const mswarehouseService = {
    findAll: async () => {
        const masterwarehouse = await mswarehouseRepository.findAllAsync();
        return new ServiceResponse(
            ResponseStatus.Success,
            "Get All success",
            masterwarehouse,
            StatusCodes.OK
        );
    },
    findById: async (master_warehouse_id: string) => {
        const masterwarehouse = await mswarehouseRepository.findById(master_warehouse_id);
        return new ServiceResponse(
            ResponseStatus.Success,
            `Get  success ${master_warehouse_id}`,
            masterwarehouse,
            StatusCodes.OK
        );
    },
    create: async (payload: TypePayloadMsWarehouse) => {
        try {
            const checkmswarehouse = await mswarehouseRepository.findByName(payload.master_warehouse_name);
            if (checkmswarehouse) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Warehouse name already taken",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }
            const masterwarehouse = await mswarehouseRepository.create(payload);
            return new ServiceResponse<masterwarehouse>(
                ResponseStatus.Success,
                "Create warehouse success",
                masterwarehouse,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error creating warehouse: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (master_warehouse_id: string, payload: Partial<TypePayloadMsWarehouse>) => {
        try {
            const masterwarehouse = await mswarehouseRepository.update(master_warehouse_id, payload);
            return new ServiceResponse<masterwarehouse>(
                ResponseStatus.Success,
                "Update warehouse success",
                masterwarehouse,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error updating warehouse: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    delete: async (master_warehouse_id: string) => {
        try {
            const masterwarehouse = await mswarehouseRepository.delete(master_warehouse_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete warehouse success",
                masterwarehouse,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error deleting warehouse: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // ดึงข้อมูลการใช้พื้นที่ของ warehouse ทั้งหมด
    getWarehouseUsage: async () => {
        try {
            // 1. ดึงข้อมูล warehouse ทั้งหมด
            const warehouses = await mswarehouseRepository.findAllAsync();

            // สร้างอาเรย์เปล่าสำหรับเก็บข้อมูลการใช้พื้นที่
            const warehouseUsageData: WarehouseUsage[] = [];

            // วนลูปแต่ละ warehouse เพื่อคำนวณการใช้พื้นที่
            for (const warehouse of warehouses) {
                const warehouseId = warehouse.master_warehouse_id;
                const totalVolume = warehouse.cubic_centimeter_warehouse || 0;

                // ดึงข้อมูล zone ทั้งหมดใน warehouse นี้
                const zones = await prisma.masterzone.findMany({
                    where: { master_warehouse_id: warehouseId }
                });

                // คำนวณพื้นที่ที่ถูกใช้โดย zone
                let usedByZones = 0;
                for (const zone of zones) {
                    usedByZones += zone.cubic_centimeter_zone || 0;
                }

                // ดึงข้อมูล rack ทั้งหมดใน warehouse นี้ (ผ่าน zone)
                const zoneIds = zones.map(zone => zone.master_zone_id);

                // ดึงข้อมูล rack ทั้งหมดใน zone เหล่านี้
                const racks = await prisma.masterrack.findMany({
                    where: {
                        master_zone_id: {
                            in: zoneIds
                        }
                    }
                });

                // ดึงข้อมูลการใช้พื้นที่จาก shelf_box_storage แทน rack_box_storage
                let usedByBoxes = 0;
                const shelfIds = await prisma.mastershelf.findMany({
                    where: {
                        master_rack_id: {
                            in: racks.map(rack => rack.master_rack_id)
                        }
                    },
                    select: {
                        master_shelf_id: true
                    }
                });

                // ถ้ามี shelf ใน warehouse นี้
                if (shelfIds.length > 0) {
                    const shelfIdArray = shelfIds.map(shelf => shelf.master_shelf_id);

                    // ดึงข้อมูลกล่องที่ถูกเก็บใน shelf ทั้งหมด
                    const storedBoxes = await prisma.shelf_box_storage.findMany({
                        where: {
                            master_shelf_id: {
                                in: shelfIdArray
                            },
                            status: 'stored'
                        }
                    });

                    // รวมพื้นที่ที่ถูกใช้โดยกล่องทั้งหมด
                    for (const box of storedBoxes) {
                        // คำนวณปริมาตรของกล่อง (ป้องกันกรณี null)
                        const boxVolume = (box.cubic_centimeter_box || 0) * (box.count || 0);
                        usedByBoxes += boxVolume;
                    }
                }

                // คำนวณพื้นที่ที่เหลือและเปอร์เซ็นต์การใช้พื้นที่
                const totalUsed = usedByBoxes; // เราใช้พื้นที่จากกล่องที่ถูกเก็บเท่านั้น ไม่รวมพื้นที่ zone
                const availableSpace = Math.max(0, totalVolume - totalUsed);

                // คำนวณเปอร์เซ็นต์การใช้พื้นที่ ป้องกันการหารด้วย 0
                let usagePercentage = 0;
                if (totalVolume > 0) {
                    usagePercentage = (totalUsed / totalVolume) * 100;
                    // ปัดเศษให้เป็นทศนิยม 2 ตำแหน่ง
                    usagePercentage = Math.round(usagePercentage * 100) / 100;
                }

                // เพิ่มข้อมูลลงในอาเรย์
                warehouseUsageData.push({
                    master_warehouse_id: warehouseId,
                    master_warehouse_name: warehouse.master_warehouse_name || '',
                    total_volume: totalVolume,
                    used_by_zones: usedByZones, // เก็บข้อมูลไว้แต่ไม่นำไปคำนวณการใช้พื้นที่
                    used_by_boxes: usedByBoxes,
                    available_space: availableSpace,
                    usage_percentage: usagePercentage,
                    width: warehouse.width || 0,
                    length: warehouse.length || 0,
                    height: warehouse.height || 0,
                    description: warehouse.description || ''
                });
            }

            return new ServiceResponse<WarehouseUsage[]>(
                ResponseStatus.Success,
                "Get warehouse usage data success",
                warehouseUsageData,
                StatusCodes.OK
            );
        } catch (ex) {
            console.error("Error getting warehouse usage:", ex);
            const errorMessage = "Error getting warehouse usage: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};