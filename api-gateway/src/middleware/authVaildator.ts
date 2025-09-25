import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import jwt from 'jsonwebtoken';

// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const validateToken = ( req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        logger.error("Authentication failed");
        return res.status(401).json({
            success: false,
             message: 'Authentication failed'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user: any)=>{
        if(err) {
            logger.error("Invalid Token")
            return res.status(429).json({
                success: false,
                message: `Invalid Token ${err.message}`
            });
        }

        req.user = user;
        next();
    });
}