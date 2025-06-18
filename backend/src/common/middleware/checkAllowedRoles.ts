import { Request, Response, NextFunction } from "express";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

function checkAllowedRoles(req: Request, res: Response, next: NextFunction): void {
    const status_role = req.user?.status_role?.toLowerCase();

    const allowedRoles = ['admin', 'manager', 'user'];

    if (!status_role || !allowedRoles.includes(status_role)) {
        const response = new ServiceResponse(
            ResponseStatus.Failed,
            "Unauthorized - Insufficient privileges",
            null,
            StatusCodes.UNAUTHORIZED
        );
        res.status(response.statusCode).json(response);
        return;
    }

    next();
}

export default checkAllowedRoles;