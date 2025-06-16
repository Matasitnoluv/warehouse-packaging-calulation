import { cal_msproductService } from '@modules/cal_msproduct/cal_msproductService';
import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest, } from "@common/utils/httpHandlers";
import { CreateCal_msproductSchema, DeleteCal_msproductSchema, UpdateCal_msproductSchema, } from "@modules/cal_msproduct/cal_msproductModel";
import { authenticateJWT } from '@common/middleware/AuthToken';
import rolegrop1 from '@common/middleware/roleAdmin';

export const cal_msproductRouter = (() => {
    const router = express.Router();

    router.get("/get", async (req: Request, res: Response) => {
        const { status } = req.query;
        const ServiceResponse = await cal_msproductService.findAll({ status: status === 'true' ? true : status === 'false' ? false : undefined });
        handleServiceResponse(ServiceResponse, res);
    });

    router.get("/get/:document_product_no", async (req: Request, res: Response) => {
        const { document_product_no } = req.params;
        const ServiceResponse = await cal_msproductService.findByNo(document_product_no);
        handleServiceResponse(ServiceResponse, res);
    });

    router.post("/create", validateRequest(CreateCal_msproductSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const ServiceResponse = await cal_msproductService.create(payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.patch("/update", validateRequest(UpdateCal_msproductSchema),
        async (req: Request, res: Response) => {
            const { cal_product_id } = req.body;
            const payload = req.body;
            const ServiceResponse = await cal_msproductService.update(cal_product_id, payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.delete("/delete/:document_product_id", validateRequest(DeleteCal_msproductSchema),
        async (req: Request, res: Response) => {
            const { document_product_id } = req.params;
            const ServiceResponse = await cal_msproductService.delete(document_product_id);
            handleServiceResponse(ServiceResponse, res);
        }
    );


    return router;
})();
