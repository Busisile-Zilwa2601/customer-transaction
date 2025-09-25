import { Filter } from "../intefaces/ITransaction";
import { TransactionModel } from "../models/Transation";
import { buildFilter } from '../utils/Filter';
import { logger } from "../utils/logger";

export class TransactionService {
    
    getTransactions = async (page: number, pageSize: number, opts: Filter[]) => {

        const query = buildFilter(opts)
        const total = await TransactionModel.countDocuments(query);
        const dataResults = await TransactionModel.find(query)
                                .sort({ timestamp: -1 })
                                .skip((page-1) * pageSize)
                                .limit(pageSize)
                                .lean();
        
        const result = { data: dataResults, page:page, skip: (page-1) * pageSize, total }

        return result;
    }
}