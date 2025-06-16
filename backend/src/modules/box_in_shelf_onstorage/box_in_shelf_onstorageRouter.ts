import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import express, { Request, Response } from "express";
import { CreateBoxInShelfSchema, DeleteBoxInShelfSchema, UpdateBoxInShelfSchema } from "./box_in_shelf_onstorageModel";
import { BoxInShelfService } from "./box_in_shelf_onstorageService";

export const boxInShelfRouter = (() => {
    const router = express.Router();
    const service = new BoxInShelfService();

    router.get("/get", async (req: Request, res: Response) => {
        const serviceResponse = await service.findAll();
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:shelf_id", async (req: Request, res: Response) => {
        const { shelf_id } = req.params;
        const serviceResponse = await service.findByShelfId(shelf_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/create", validateRequest(CreateBoxInShelfSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const serviceResponse = await service.create(payload);
            handleServiceResponse(serviceResponse, res);
        }
    );

    router.patch("/update/:shelf_id", validateRequest(UpdateBoxInShelfSchema),
        async (req: Request, res: Response) => {
            const { shelf_id } = req.params;
            const payload = req.body;
            const serviceResponse = await service.update(shelf_id, payload);
            handleServiceResponse(serviceResponse, res);
        }
    );

    router.delete("/delete/:shelf_id", validateRequest(DeleteBoxInShelfSchema),
        async (req: Request, res: Response) => {
            const { shelf_id } = req.params;
            const serviceResponse = await service.delete(shelf_id);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();
