import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest, } from "@common/utils/httpHandlers";
import { msboxService } from "@modules/msbox/msboxServices";
import { CreateMsboxSchema, DeleteMsboxSchema, UpdateMsboxSchema, } from "@modules/msbox/msboxModel";
import multer from "multer";
import path from "path";
import { authenticateJWT } from "@common/middleware/AuthToken";
import checkAllowedRoles from "@common/middleware/checkAllowedRoles";
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

export const msboxRouter = (() => {
  const router = express.Router();

  router.get("/get", authenticateJWT, checkAllowedRoles, async (req: Request, res: Response) => {
    const ServiceResponse = await msboxService.findAll();
    handleServiceResponse(ServiceResponse, res);
  });

  router.post("/create", authenticateJWT, checkAllowedRoles, upload.single('image'),
    async (req: Request, res: Response) => {
      const payload = {
        ...req.body,
        image_path: req.file ? `/uploads/${req.file.filename}` : ''
      };
      const ServiceResponse = await msboxService.create(payload);
      handleServiceResponse(ServiceResponse, res);
    }
  );

  router.patch("/update", authenticateJWT, checkAllowedRoles, upload.single('image'),
    async (req: Request, res: Response) => {
      const { master_box_id } = req.body;
      const payload = {
        ...req.body,
        image_path: req.file ? `/uploads/${req.file.filename}` : req.body.image_path
      };
      const ServiceResponse = await msboxService.update(master_box_id, payload);
      handleServiceResponse(ServiceResponse, res);
    }
  );

  router.delete("/delete/:master_box_id", authenticateJWT, checkAllowedRoles, validateRequest(DeleteMsboxSchema),
    async (req: Request, res: Response) => {
      const { master_box_id } = req.params;
      const ServiceResponse = await msboxService.delete(master_box_id);
      handleServiceResponse(ServiceResponse, res);
    }
  );

  router.get("/", async (req, res) => {
    const boxes = await prisma.masterbox.findMany();
    res.json({ responseObject: boxes });
  });

  return router;
})();
