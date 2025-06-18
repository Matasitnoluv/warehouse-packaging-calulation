import express, { Request, Response } from "express";
import { exportBoxService } from "./exportBoxService";
import { CreateExportBoxSchema, GetExportBoxLogSchema } from "./exportBoxModel";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";

export const exportBoxRouter = express.Router();

// Export a box
exportBoxRouter.post(
    "/",
    validateRequest(CreateExportBoxSchema),
    async (req: Request, res: Response) => {
        const payload = req.body;
        const serviceResponse = await exportBoxService.exportBox(payload);
        handleServiceResponse(serviceResponse, res);
    }
);

// Get export logs with optional filtering
exportBoxRouter.get(
    "/logs",
    async (req: Request, res: Response) => {
        const filters = {
            warehouse_id: req.query.warehouse_id as string,
            zone_id: req.query.zone_id as string,
            start_date: req.query.start_date as string,
            end_date: req.query.end_date as string,
        };
        
        const serviceResponse = await exportBoxService.getExportLogs(filters);
        handleServiceResponse(serviceResponse, res);
    }
);

// Get stored boxes that can be exported, filtered by warehouse, zone, and rack
exportBoxRouter.get(
    "/stored-boxes",
    async (req: Request, res: Response) => {
        const warehouse_id = req.query.warehouse_id as string;
        const zone_id = req.query.zone_id as string;
        const rack_id = req.query.rack_id as string;
        
        const serviceResponse = await exportBoxService.getStoredBoxesForExport(warehouse_id, zone_id, rack_id);
        handleServiceResponse(serviceResponse, res);
    }
);
