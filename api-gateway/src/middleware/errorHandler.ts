import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";

interface myError extends Error{
    stack?: string;
    status?: number;
    message: string;
}

export const errorHandler = (err: myError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(err.stack);

    res.status(err.status || 500).json({
        message: err.message || 'Internal Service Error'
    });
} 