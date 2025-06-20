import express, { Request, Response } from "express";
import { shelfBoxStorageServices } from "./shelfBoxStorageServices";

const router = express.Router();

// Get all shelf box storage records
router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await shelfBoxStorageServices.getAllAsync();
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully retrieved all shelf box storage records",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve shelf box storage records",
        });
    }
});

// Get shelf box storage records by shelf ID
router.get("/shelf/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const result = await shelfBoxStorageServices.getByShelfIdAsync(id);
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully retrieved shelf box storage records by shelf ID",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve shelf box storage records by shelf ID",
        });
    }
});

router.get("/storage/:id", async (req: Request, res: Response) => {

    try {

          
        const id = req.params.id;
        const result = await shelfBoxStorageServices.getShelfCompileAsync(id);
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully retrieved shelf box storage records by shelf ID",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve shelf box storage records by shelf ID",
        });
    }
});
// Get shelf box storage records by shelf ID
// {master_warehouse_id:"", master_zone_id:""}
router.get("/get_export/:master_warehouse_id/:master_zone_id", async (req: Request, res: Response) => {
    try {

        const { master_warehouse_id, master_zone_id } = req.params;
        if (!master_warehouse_id || !master_zone_id) {
            res.status(400).json({
                success: false,
                message: "Missing required fields: master_warehouse_id or master_zone_id"
            });
        }

        const result = await shelfBoxStorageServices.getShelfExportAsync({ master_warehouse_id, master_zone_id });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve shelf box storage records by shelf ID",
        });
    }
});

// Get shelf box storage records by document number
router.get("/document/:docNo", async (req: Request, res: Response) => {
    try {
        const docNo = req.params.docNo;
        const result = await shelfBoxStorageServices.getByDocumentNoAsync(docNo);
        res.json({
            success: true,
            responseObject: result.responseObject,
            message: result.message,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve shelf box storage records by document number",
        });
    }
});

// Get shelf box storage records by document number
router.get("/document-warehouse/:docNo/:master_zone_id", async (req: Request, res: Response) => {
    try {
        const { docNo, master_zone_id } = req.params;
        const result = await shelfBoxStorageServices.getByDocumentWarehouseNoAsync(docNo, master_zone_id);
        res.json({
            success: true,
            responseObject: result.responseObject,
            message: result.message,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve shelf box storage records by document number",
        });
    }
});

// Create a new shelf box storage record
router.post("/", async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const result = await shelfBoxStorageServices.createAsync(payload);
        res.status(201).json({
            success: true,
            responseObject: result,
            message: "Successfully created shelf box storage record",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create shelf box storage record",
        });
    }
});

router.put("/update/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const result = await shelfBoxStorageServices.updateAsync(id, payload);
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully updated shelf box storage record",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update shelf box storage record",
        });
    }
});

router.put("/update_many", async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const result = await shelfBoxStorageServices.updateMany(payload);
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully updated shelf box storage record",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update shelf box storage record",
        });
    }
});

// Delete a shelf box storage record
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const result = await shelfBoxStorageServices.deleteAsync(id);
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully deleted shelf box storage record",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete shelf box storage record",
        });
    }
});

export const shelfBoxStorageRouter = router;
