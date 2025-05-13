import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;

    if (token) {
        const decoded = verifyToken(token) as { users_id?: string; status_role?: string; expired?: boolean; iat?: number; exp?: number };

        if (decoded?.expired) {
            res.status(401).json({ message: "Token expired", expired: true });
            return;
        }

        if (!decoded || !decoded.users_id) {
            res.status(403).json({ message: "Invalid token" });
            return;
        }

        req.user = decoded;
        next();
    } else {
        res.status(401).json({ message: "Authorization token missing" });
    }
};