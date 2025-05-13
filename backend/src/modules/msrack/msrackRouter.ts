import express from "express";
import { msrackServices } from "./msrackServices";

const router = express.Router();

router.get("/get", async (req, res) => {
    const { master_zone_id } = req.query;
    const result = await msrackServices.findAll(master_zone_id as string);
    res.status(result.statusCode).json(result);
});

router.get("/get/:id", async (req, res) => {
    const { id } = req.params;
    const result = await msrackServices.findById(id);
    res.status(result.statusCode).json(result);
});

router.post("/create", async (req, res) => {
    const payload = req.body;
    const result = await msrackServices.create(payload);
    res.status(result.statusCode).json(result);
});

router.patch("/update", async (req, res) => {
    const payload = req.body;
    const result = await msrackServices.update(payload);
    res.status(result.statusCode).json(result);
});

router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    const result = await msrackServices.delete(id);
    res.status(result.statusCode).json(result);
});

export default router;