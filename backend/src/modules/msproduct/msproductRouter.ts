import express, { Request, Response } from "express";
import { msproductService } from "@modules/msproduct/msproductServices";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { CreatMsproductSchema, UpdateMsproductSchema, DeleteMsproductSchema } from "@modules/msproduct/msproductModel";
import { authenticateJWT } from "@common/middleware/AuthToken";
import multer from "multer";
import path from "path";
import checkAllowedRoles from "@common/middleware/checkAllowedRoles";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});


const prisma = new PrismaClient();


export const msproductRouter = (() => {
    const router = express.Router();

    router.get("/get", authenticateJWT, checkAllowedRoles, async (req: Request, res: Response) => {
        const ServiceResponse = await msproductService.findAll();
        handleServiceResponse(ServiceResponse, res);
    });

    router.post("/create", authenticateJWT, checkAllowedRoles, upload.single('image'),
        async (req: Request, res: Response) => {
            const payload = {
                ...req.body,
                image_path: req.file ? `/uploads/${req.file.filename}` : ''
            };
            const ServiceResponse = await msproductService.create(payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.patch("/update", authenticateJWT, checkAllowedRoles, upload.single('image'),
        async (req: Request, res: Response) => {
            const { master_product_id } = req.body;
            const payload = {
                ...req.body,
                image_path: req.file ? `/uploads/${req.file.filename}` : undefined
            };
            const ServiceResponse = await msproductService.update(master_product_id, payload);
            handleServiceResponse(ServiceResponse, res);
        }
    );

    router.delete("/delete/:master_product_id", authenticateJWT, checkAllowedRoles, validateRequest(DeleteMsproductSchema),
        async (req: Request, res: Response) => {
            const { master_product_id } = req.params;
            const ServiceResponse = await msproductService.delete(master_product_id);
            handleServiceResponse(ServiceResponse, res);
        }
    );




    // Get all products
    router.get("/", async (req, res) => {
        const products = await prisma.masterproduct.findMany();
        res.json({ responseObject: products });
    });

    // Add new product
    router.post("/", async (req, res) => {
        const { master_product_name, code_product, scale_product, height, length, width, cubic_centimeter_product, count, description, image_path } = req.body;
        const product = await prisma.masterproduct.create({
            data: {
                master_product_name,
                code_product,
                scale_product,
                height,
                length,
                width,
                cubic_centimeter_product,
                description,
                image_path,
                sort_by: 1, // หรือ logic อื่น
            },
        });
        res.json({ responseObject: product });
    });

    return router;



})();
