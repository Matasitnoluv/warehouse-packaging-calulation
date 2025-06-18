import { ServiceResponse } from '@common/models/serviceResponse';
import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest, } from "@common/utils/httpHandlers";
import { userService } from "@modules/user/userServices";
import { CreateuserSchema, DeleteuserSchema, UpdateuserSchema, } from "@modules/user/userModel";
import { authenticateJWT } from "@common/middleware/AuthToken";
import checkAllowedRoles from "@common/middleware/checkAllowedRoles";

export const userRouter = (() => {
  const router = express.Router();
  router.get("/get", authenticateJWT, checkAllowedRoles, async (req: Request, res: Response) => {
    const ServiceResponse = await userService.findAll();
    handleServiceResponse(ServiceResponse, res);
  });

  router.post("/create", authenticateJWT, checkAllowedRoles, validateRequest(CreateuserSchema),
    async (req: Request, res: Response) => {
      const payload = req.body;
      const ServiceResponse = await userService.create(payload);
      handleServiceResponse(ServiceResponse, res);
    }
  );

  router.put("/update", authenticateJWT, checkAllowedRoles, validateRequest(UpdateuserSchema),
    async (req: Request, res: Response) => {
      const { users_id } = req.body;
      const payload = req.body;
      const ServiceResponse = await userService.update(users_id, payload);
      handleServiceResponse(ServiceResponse, res);
    }
  );

  router.delete("/delete/:users_id", authenticateJWT, checkAllowedRoles, validateRequest(DeleteuserSchema),
    async (req: Request, res: Response) => {
      const { users_id } = req.params;
      const ServiceResponse = await userService.delete(users_id);
      handleServiceResponse(ServiceResponse, res);
    }
  );

  return router;
})();
