import express, { Request, Response } from "express";
import { rack_box_storageService } from "@modules/rack_box_storage/rack_box_storageService";

const router = express.Router();

// Get all stored boxes
router.get("/", async (req: Request, res: Response) => {
    const response = await rack_box_storageService.findAll();
    return res.status(response.statusCode).json(response);
});

// Get boxes stored in a specific rack
router.get("/rack/:master_rack_id", async (req: Request, res: Response) => {
    const { master_rack_id } = req.params;
    const response = await rack_box_storageService.findByRackId(master_rack_id);
    return res.status(response.statusCode).json(response);
});

// Get details of a specific stored box
router.get("/:storage_id", async (req: Request, res: Response) => {
    const { storage_id } = req.params;
    const response = await rack_box_storageService.findById(storage_id);
    return res.status(response.statusCode).json(response);
});

// Store a box in a rack
router.post("/", async (req: Request, res: Response) => {
    const payload = req.body;
    const response = await rack_box_storageService.create(payload);
    return res.status(response.statusCode).json(response);
});

// Update a stored box (change status or position)
router.put("/:storage_id", async (req: Request, res: Response) => {
    const { storage_id } = req.params;
    const payload = req.body;
    const response = await rack_box_storageService.update(storage_id, payload);
    return res.status(response.statusCode).json(response);
});

// Delete a stored box record
router.delete("/:storage_id", async (req: Request, res: Response) => {
    const { storage_id } = req.params;
    const response = await rack_box_storageService.delete(storage_id);
    return res.status(response.statusCode).json(response);
});

// Backward compatibility routes
// Get all stored boxes (old endpoint)
router.get("/get", async (req: Request, res: Response) => {
    const response = await rack_box_storageService.findAll();
    return res.status(response.statusCode).json(response);
});

// Get boxes stored in a specific rack (old endpoint)
router.get("/get/:master_rack_id", async (req: Request, res: Response) => {
    const { master_rack_id } = req.params;
    const response = await rack_box_storageService.findByRackId(master_rack_id);
    return res.status(response.statusCode).json(response);
});

// Get details of a specific stored box (old endpoint)
router.get("/detail/:storage_id", async (req: Request, res: Response) => {
    const { storage_id } = req.params;
    const response = await rack_box_storageService.findById(storage_id);
    return res.status(response.statusCode).json(response);
});

// Store a box in a rack (old endpoint)
router.post("/store", async (req: Request, res: Response) => {
    const payload = req.body;
    const response = await rack_box_storageService.create(payload);
    return res.status(response.statusCode).json(response);
});

// Update a stored box (old endpoint)
router.patch("/update", async (req: Request, res: Response) => {
    const { storage_id, ...payload } = req.body;
    const response = await rack_box_storageService.update(storage_id, payload);
    return res.status(response.statusCode).json(response);
});

// Delete a stored box record (old endpoint)
router.delete("/delete/:storage_id", async (req: Request, res: Response) => {
    const { storage_id } = req.params;
    const response = await rack_box_storageService.delete(storage_id);
    return res.status(response.statusCode).json(response);
});

export const rack_box_storageRouter = router;
