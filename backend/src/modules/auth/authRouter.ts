import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authService } from "@modules/auth/authService";
import { LoginUserSchema } from "@modules/auth/authModel";
import { authenticateJWT } from "@common/middleware/AuthToken";

export const authRouter = (() => {
    const router = express.Router();

    // CREATE a user
    router.post("/login", validateRequest(LoginUserSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const serviceResponse = await authService.login(payload, res, req);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/logout", async (req: Request, res: Response) => {
        const serviceResponse = await authService.logout(res);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/verify", authenticateJWT, async (req: Request, res: Response) => {
        const serviceResponse = await authService.verifyToken(req.user);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();