import express from "express";
import { logger } from '../utils/logger';
import { CacheService } from '../middleware/cacheService';
import { TransactionService } from '../service/transaction_service';
import { Filter, IStatus } from "../intefaces/ITransaction";
import { ITransaction } from "../models/Transation";

export class TransactionController {

    private trans_service: TransactionService;
    
    constructor() {
        this.trans_service = new TransactionService();
    }

    getTransactions = async (req: express.Request, res: express.Response): Promise<any> => {
        try {
            const page = Number.isNaN(Number(req.query.page)) ? 1 : parseInt(req.query.page as string, 10);
            const pageSize = Number.isNaN(Number(req.query.pageSize)) ? 10 : parseInt(req.query.pageSize as string, 10);
            const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
            const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;
            const category = typeof req.query.category === "string" ? req.query.category : undefined;
            const status = typeof req.query.status === "string" ? req.query.status : undefined; 
            const opts: Filter[] = [];
            
            if (startDate) {
                opts.push({ field: "startDate", value: startDate });
            }
            
            if (endDate) {
                opts.push({ field: "endDate", value: endDate });
            }
            if (category) {
                opts.push({ field: "category", value: category });
            }

            if (status) {
                opts.push({ field: "status", value: status });
            }

            const user = req.user?.userId;

            //build cache key
            const cacheKey = `transactions:${user}:${JSON.stringify({page, pageSize, opts})}`;
            
            //Get the from cache
            const cacheData = await CacheService.get(cacheKey);
            if(cacheData !== null && cacheData !== undefined) {
                const parsed = typeof cacheData === "string" ? JSON.parse(cacheData) : cacheData;

                if(Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)
                {
                    return res.status(200).json({
                        success: true,
                        cacheData
                    })
                }
            }

            //not cached
            const result = await this.trans_service.getTransactions(page, pageSize, opts);
            await CacheService.set(cacheKey, result)

            res.status(200).json({
                result
            });
        }catch(err){
            logger.error('Transation error occured', err)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    transaction = async (req: express.Request, res: express.Response): Promise<any> => {
        try {
            const authToken = req.token;
            const user = req.user?.userId;
            if(!authToken)
            {
                logger.error("No Authorization header");
                return res.status(401).json({ success: false, message: 'Authentication Failed' });
            }
            
            const trans: ITransaction = req.body;

            const result = await this.trans_service.createTransaction(trans, authToken);
            
            if(!result){
                logger.error("nothing return");
                return res.status(400).json({
                    success: false,
                    message: "Bad request"
                });
            }

            if(result?.status === IStatus.Failed)
            {
                return res.status(400).json({
                    message: 'Insufficient funds'
                });
            }

            //clear cache
            if(user)
            {
                await CacheService.del(user);
            };
            
            logger.info("Succefully created transaction")
            res.status(200).json({
                success: true,
                result
            });

        } catch (error) {
            logger.error('Transation error occured', error)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}