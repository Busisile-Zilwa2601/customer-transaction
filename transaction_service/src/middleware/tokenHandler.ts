import { logger } from "../utils/logger";
import express from "express";
import jwt from 'jsonwebtoken';

// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
            token?: string;
        }
    }
}
export const tokenRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        logger.error("No Authorization header");
        return res.status(401).json({ success: false, message: 'Authentication Failed' });
    }

    const token = authHeader.split(' ')[1].trim();
    try {

        jwt.verify(token, process.env.JWT_SECRET as string, (err, user: any)=>{
        if(err) {
                logger.error("Invalid Token")
                return res.status(429).json({
                    success: false,
                    message: `Invalid Token ${err.message}`
                });
            }
            req.token = token;
            req.user = user;
            next();
        });
    } catch (err) {
        logger.error("Invalid token", err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}