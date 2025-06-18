import express from "express";
import { msshelfServices } from "./msshelfServices";

const router = express.Router();

// Get all shelves or filter by rack ID
router.get("/", async (req, res) => {
    try {
        const { master_rack_id } = req.query;
        const response = await msshelfServices.findAllAsync(master_rack_id as string);
        res.json(response);
    } catch (error) {
        console.error("Error in GET /api/msshelf:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            responseObject: null
        });
    }
});

// Get shelf by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await msshelfServices.findByIdAsync(id);
        res.json(response);
    } catch (error) {
        console.error("Error in GET /api/msshelf/:id:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            responseObject: null
        });
    }
});

// Create new shelf
router.post("/", async (req, res) => {
    try {
        const payload = req.body;
        const response = await msshelfServices.createAsync(payload);
        res.json(response);
    } catch (error) {
        console.error("Error in POST /api/msshelf:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            responseObject: null
        });
    }
});

// Update shelf
router.put("/", async (req, res) => {
    try {
        const payload = req.body;
        const response = await msshelfServices.updateAsync(payload);
        res.json(response);
    } catch (error) {
        console.error("Error in PUT /api/msshelf:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            responseObject: null
        });
    }
});

// Delete shelf
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await msshelfServices.deleteAsync(id);
        res.json(response);
    } catch (error) {
        console.error("Error in DELETE /api/msshelf/:id:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            responseObject: null
        });
    }
});

export default router;
