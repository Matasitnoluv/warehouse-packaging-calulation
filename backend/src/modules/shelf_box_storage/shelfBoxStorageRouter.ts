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

// Get shelf box storage records by document number
router.get("/document/:docNo", async (req: Request, res: Response) => {
    try {
        const docNo = req.params.docNo;
        const result = await shelfBoxStorageServices.getByDocumentNoAsync(docNo);
        res.json({
            success: true,
            responseObject: result,
            message: "Successfully retrieved shelf box storage records by document number",
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

// Route for storing multiple boxes in a shelf
router.post("/store-multiple", async (req: Request, res: Response) => {
    try {
        const payloads = req.body;
        
        if (!Array.isArray(payloads) || payloads.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payload. Expected an array of box storage data.",
            });
        }
        
        // Process each box storage request
        const results = [];
        let successCount = 0;
        let failedCount = 0;
        
        for (const payload of payloads) {
            try {
                const result = await shelfBoxStorageServices.createAsync(payload);
                if (result.success && result.responseObject) {
                    results.push({
                        success: true,
                        cal_box_id: payload.cal_box_id,
                        storage_id: result.responseObject.storage_id,
                    });
                    successCount++;
                } else {
                    results.push({
                        success: false,
                        cal_box_id: payload.cal_box_id,
                        error: result.message || "Failed to store box",
                    });
                    failedCount++;
                }
            } catch (error: any) {
                results.push({
                    success: false,
                    cal_box_id: payload.cal_box_id,
                    error: error.message || "Failed to store box",
                });
                failedCount++;
            }
        }
        
        return res.status(200).json({
            success: true,
            message: `Successfully stored ${successCount} boxes, failed to store ${failedCount} boxes`,
            responseObject: {
                successCount,
                failedCount,
                results,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to store boxes",
        });
    }
});

// Update a shelf box storage record
router.put("/:id", async (req: Request, res: Response) => {
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
