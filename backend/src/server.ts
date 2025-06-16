import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pino } from "pino";
import { PrismaClient } from "@prisma/client";
import { env } from "@common/utils/envConfig";
import errorHandler from "@common/middleware/errorHandler";

import { categoryRouter } from "@modules/categories/categoryRouter";
import { msboxRouter } from "@modules/msbox/msboxRouter";
import { userRouter } from "@modules/user/userRouter";
import { msproductRouter } from "@modules/msproduct/msproductRouter";
import { cal_msproductRouter } from "@modules/cal_msproduct/cal_msproductRouter";
import { authRouter } from "@modules/auth/authRouter";
import { cal_boxRouter } from "@modules/cal_box/cal_boxRouter";
import { mswarehouseRouter } from "@modules/mswarehouse/mswarehouseRouter";
import { mszoneRouter } from "@modules/mszone/mszoneRouter";
import msrackRouter from "./modules/msrack/msrackRouter";
import msshelfRouter from "./modules/msshelf/msshelfRouter";
import { rack_box_storageRouter } from "@modules/rack_box_storage/rack_box_storageRouter";
import { shelfBoxStorageRouter } from "./modules/shelf_box_storage/shelfBoxStorageRouter";
import { exportBoxRouter } from "@modules/export_box/exportBoxRouter";
import path from "path";
import { cal_warehouseRouter } from "@modules/cal_warehouse/cal_warehouseRouter";
import { boxInShelfRouter } from "@modules/box_in_shelf_onstorage/box_in_shelf_onstorageRouter";

const prisma = new PrismaClient();
const logger = pino({ name: "server start" });
const app = express();

app.use(cookieParser()); // ใช้ cookie-parser เพื่ออ่าน cookies

// login
// Middlewares
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    exposedHeaders: ['Content-Type', 'Content-Disposition']
}));

// Configure static file serving with CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', env.CORS_ORIGIN);
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/v1/category", categoryRouter);
app.use("/v1/msbox", msboxRouter);
app.use("/v1/users", userRouter);
app.use("/v1/msproduct", msproductRouter);
app.use("/v1/cal_msproduct", cal_msproductRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/cal_box", cal_boxRouter);
app.use("/v1/mswarehouse", mswarehouseRouter);
app.use("/v1/mszone", mszoneRouter);
app.use("/v1/msrack", msrackRouter);
app.use("/v1/msshelf", msshelfRouter);
app.use("/v1/rack_box_storage", rack_box_storageRouter);
app.use("/v1/shelf_box_storage", shelfBoxStorageRouter);
app.use("/v1/export-box", exportBoxRouter);
app.use("/v1/cal_warehouse", cal_warehouseRouter);
app.use("/v1/box_in_shelf_onstorage", boxInShelfRouter);

// Error handlers
app.use(errorHandler());

// Add cookieParser middleware
// app.use(cookieParser());

export { app, logger };
