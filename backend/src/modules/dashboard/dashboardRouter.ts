import express, { Request, Response } from "express";
import { dashboardServices } from "./dashboardServices";

const router = express.Router();

// Get dashboard overview data
router.get("/overview", async (req: Request, res: Response) => {
    try {
        const result = await dashboardServices.getDashboardOverview();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to get dashboard overview",
        });
    }
});

export default router;