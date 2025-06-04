import { cal_warehouseService } from '@modules/cal_warehouse/cal_warehouseService';
import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest, } from "@common/utils/httpHandlers";
import { CreateCal_warehouseSchema, DeleteCal_warehouseSchema, UpdateCal_warehouseSchema, } from "@modules/cal_warehouse/cal_warehouseModel";

export const cal_warehouseRouter = (() => {
    const router = express.Router();

    router.get("/get", async (req: Request, res: Response) => {
        const ServiceResponse = await cal_warehouseService.findAll();
        handleServiceResponse(ServiceResponse, res);
    });

    router.post("/create", validateRequest(CreateCal_warehouseSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const ServiceResponse = await cal_warehouseService.create(payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.patch("/update", validateRequest(UpdateCal_warehouseSchema),
        async (req: Request, res: Response) => {
            const { document_warehouse_id } = req.body;
            const payload = req.body;
            const ServiceResponse = await cal_warehouseService.update(document_warehouse_id, payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.delete("/delete/:document_warehouse_id", validateRequest(DeleteCal_warehouseSchema),
        async (req: Request, res: Response) => {
            const { document_warehouse_id } = req.params;
            const ServiceResponse = await cal_warehouseService.delete(document_warehouse_id);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    return router;
})();