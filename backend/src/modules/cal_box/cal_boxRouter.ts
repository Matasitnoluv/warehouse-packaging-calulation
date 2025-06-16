import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import express, { Request, Response } from "express";
import { CreateCal_boxSchema, DeleteCal_boxSchema, UpdateCal_boxSchema } from "@modules/cal_box/cal_boxModel";
import { cal_boxService } from "@modules/cal_box/cal_boxService";

export const cal_boxRouter = (() => {
    const router = express.Router();

    router.get("/get", async (req: Request, res: Response) => {
        const { document_product_no } = req.query;

        // If document_product_no is provided, filter boxes by document
        if (document_product_no) {
            const serviceResponse = await cal_boxService.findByDocumentProductNo(document_product_no as string);
            handleServiceResponse(serviceResponse, res);
        } else {
            // Otherwise, return all boxes
            const serviceResponse = await cal_boxService.findAll();
            handleServiceResponse(serviceResponse, res);
        }
    });

    router.get("/get/:document_product_no", async (req: Request, res: Response) => {
        const { document_product_no } = req.params;
        const ServiceResponse = await cal_boxService.findByNo(document_product_no);
        handleServiceResponse(ServiceResponse, res);
    });

    router.post("/create", validateRequest(CreateCal_boxSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const ServiceResponse = await cal_boxService.create(payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.patch("/update", validateRequest(UpdateCal_boxSchema),
        async (req: Request, res: Response) => {
            const { cal_box_id } = req.body;
            const payload = req.body;
            const ServiceResponse = await cal_boxService.update(cal_box_id, payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.delete("/delete/:cal_box_id", validateRequest(DeleteCal_boxSchema),
        async (req: Request, res: Response) => {
            const { cal_box_id } = req.params;
            const ServiceResponse = await cal_boxService.delete(cal_box_id);
            handleServiceResponse(ServiceResponse, res);
        }
    );
    return router;
})();