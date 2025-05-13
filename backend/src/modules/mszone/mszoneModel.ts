import { z } from "zod";
// TypeScript Type สำหรับ Payload ที่มี Zone
export type TypePayloadMsZone = {
    master_zone_id: string; // ระบุ Zone
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
    master_warehouse_id: string; // Added warehouse ID to associate zones with warehouses
    create_by: string;
    create_date: string;
    update_by: string;
    update_date: string;
};

// Schema สำหรับการสร้างกล่องพร้อม Zone
export const CreateMszoneSchema = z.object({
    body: z.object({
        master_zone_id: z.string(),
        master_zone_name: z.string(),
        height: z.number(),
        length: z.number(),
        width: z.number(),
        cubic_centimeter_zone: z.number(),
        description: z.string(),
        master_warehouse_id: z.string(), // Added warehouse ID
    }),
});

// Schema สำหรับการอัปเดตกล่องพร้อม Zone
export const UpdateMszoneSchema = z.object({
    body: z.object({
        master_zone_id: z.string(),
        master_zone_name: z.string(),
        height: z.number(),
        length: z.number(),
        width: z.number(),
        cubic_centimeter_zone: z.number(),
        description: z.string(),
        master_warehouse_id: z.string(), // Added warehouse ID
    }),
});

// Schema สำหรับการลบกล่องตาม Zone
export const DeleteMszoneSchema = z.object({
    params: z.object({
        master_zone_id: z.string(),
    }),
});