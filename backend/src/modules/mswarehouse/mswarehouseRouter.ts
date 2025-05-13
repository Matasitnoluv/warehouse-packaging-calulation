import express, { Request, Response } from "express";
import { mswarehouseService } from "@modules/mswarehouse/mswarehouseService";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { CreateMsWarehouseSchema, UpdateMsWarehouseSchema, DeleteMsWarehouseSchema } from "@modules/mswarehouse/mswarehouseModel";

export const mswarehouseRouter = (() => {
    const router = express.Router();

    router.get("/get", async (req: Request, res: Response) => {
        const ServiceResponse = await mswarehouseService.findAll();
        handleServiceResponse(ServiceResponse, res);
    });

    router.post("/create", validateRequest(CreateMsWarehouseSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const ServiceResponse = await mswarehouseService.create(payload);
        handleServiceResponse(ServiceResponse, res);
    });

    router.patch("/update", validateRequest(UpdateMsWarehouseSchema), async (req: Request, res: Response) => {
        const { master_warehouse_id } = req.body;
        const payload = req.body;
        const ServiceResponse = await mswarehouseService.update(master_warehouse_id, payload);
        handleServiceResponse(ServiceResponse, res);
    });

    router.delete("/delete/:master_warehouse_id", validateRequest(DeleteMsWarehouseSchema), async (req: Request, res: Response) => {
        const { master_warehouse_id } = req.params;
        const ServiceResponse = await mswarehouseService.delete(master_warehouse_id);
        handleServiceResponse(ServiceResponse, res);
    });

    // Endpoint สำหรับดึงข้อมูลการใช้พื้นที่ของ warehouse ทั้งหมด
    router.get("/usage", async (req: Request, res: Response) => {
        const ServiceResponse = await mswarehouseService.getWarehouseUsage();
        handleServiceResponse(ServiceResponse, res);
    });

    return router;
})();
