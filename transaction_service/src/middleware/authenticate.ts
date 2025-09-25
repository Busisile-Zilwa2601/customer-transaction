import { logger } from "../utils/logger";
import express from "express";

// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export const authenticateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const userId = req.headers['x-user-id'];

    if(!userId)
    {
        logger.error("User Access Denied");
        return res.status(401).json({
            success: false,
            messsage: 'Authentication Failed'
        });
    }

    req.user = {userId}
    next();
}