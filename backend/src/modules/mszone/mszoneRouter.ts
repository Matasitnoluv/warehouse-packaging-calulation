import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { CreateMszoneSchema, UpdateMszoneSchema, DeleteMszoneSchema } from "./mszoneModel";
import { mszoneService } from "@modules/mszone/mszoneServices";


export const mszoneRouter = (() => {
    const router = express.Router();

    // API ดึงข้อมูล Zone ทั้งหมด หรือกรองตาม warehouse_id
    router.get("/get", async (req: Request, res: Response) => {
        const { master_warehouse_id } = req.query; // รับค่า warehouse_id จาก query string
        const ServiceResponse = await mszoneService.findAll(master_warehouse_id as string); // ส่งค่า warehouse_id ไปยัง service
        handleServiceResponse(ServiceResponse, res);
    });

    // API สร้าง Zone ใหม่
    router.post("/create", validateRequest(CreateMszoneSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const { height, length, width } = payload;

            // คำนวณปริมาตร
            payload.cubic_centimeter_zone = height * length * width;

            const ServiceResponse = await mszoneService.create(payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    // API อัปเดต Zone
    router.patch("/update", validateRequest(UpdateMszoneSchema),
        async (req: Request, res: Response) => {
            const { master_zone_id } = req.body;
            const payload = req.body;
            const { height, length, width } = payload;

            // คำนวณปริมาตร
            payload.cubic_centimeter_zone = height * length * width;

            const ServiceResponse = await mszoneService.update(master_zone_id, payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    // API ลบ Zone
    router.delete("/delete/:master_zone_id", validateRequest(DeleteMszoneSchema),
        async (req: Request, res: Response) => {
            const { master_zone_id } = req.params;
            const ServiceResponse = await mszoneService.delete(master_zone_id as string);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    return router;
})();
