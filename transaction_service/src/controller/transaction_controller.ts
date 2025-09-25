import express from "express";
import { logger } from '../utils/logger';
import { CacheService } from '../middleware/cacheService';
import { TransactionService } from '../service/transaction_service';
import { Filter } from "../intefaces/ITransaction";

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

            const user = req.user;

            //build cache key
            const cacheKey = `transactions:${user}:${JSON.stringify({page, pageSize, opts})}`;

            //Get the from cache
            const cacheData = await CacheService.get(cacheKey);
            if(cacheData) {
                return res.status(200).json({
                    success: true,
                    cacheData
                })
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
}