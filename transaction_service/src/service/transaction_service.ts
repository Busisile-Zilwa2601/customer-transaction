import axios from 'axios';
import { Filter, IAccountType, IAccount, IStatus } from "../intefaces/ITransaction";
import { ITransaction, TransactionModel } from "../models/Transation";
import { buildFilter } from '../utils/Filter';
import { logger } from "../utils/logger";

const ACCOUNT_SERVICE = process.env.ACCOUNT_SERVICE_URL as string;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class TransactionService {

    getTransactions = async (page: number, pageSize: number, opts: Filter[]) => {

        const query = buildFilter(opts);
        const total = await TransactionModel.countDocuments(query);
        const dataResults = await TransactionModel.find(query)
                                .sort({ timestamp: -1 })
                                .skip((page-1) * pageSize)
                                .limit(pageSize)
                                .lean();
        
        const result = { data: dataResults, page:page, pageSize: pageSize, total }

        return result;
    }

    createTransaction = async ( transaction: ITransaction, token: string) => {
        try {
            const account_service = await axios.get<ApiResponse<IAccount>>(
                `${ACCOUNT_SERVICE}/api/account/get/${transaction.accountId}`, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if(account_service.status !== 200 || !account_service.data)
            {
                logger.error(`Account Not Found: ${transaction.accountId}`);
                throw new Error("Account Not Found")
            }

            const accountData = account_service.data.data;

            const accountService = axios.create({
                    baseURL: `${ACCOUNT_SERVICE}/api/account`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
            });

            if(transaction.amount > 0)
            {
                const result = await TransactionModel.create({
                    accountId: transaction.accountId,
                    type: transaction.type,
                    bankId: transaction.bankId,
                    description: transaction.description,
                    category: transaction.category,
                    currency: transaction.currency,
                    amount: transaction.amount,
                    status: IStatus.Pending,
                    date: new Date()
                });

                const updatingAccountModel: IAccount = {
                    accountId: accountData.accountId,
                    balance: transaction.amount,
                    userId: accountData.userId,
                    type: accountData.type
                };

                await accountService.patch('/account', updatingAccountModel);
                return result;
            }
            
            if( transaction.amount < 0)
            {
                let transactionSum = accountData.balance + transaction.amount;
                if(transactionSum < 0)
                {
                    return await TransactionModel.create({
                        accountId: transaction.accountId,
                        type: transaction.type,
                        bankId: transaction.bankId,
                        description: transaction.description,
                        category: transaction.category,
                        currency: transaction.currency,
                        amount: transaction.amount,
                        status: IStatus.Failed,
                        reason: "Insufficient funds",
                        date: new Date()
                    });
                }else {
                    const result = await TransactionModel.create({
                        accountId: transaction.accountId,
                        type: transaction.type,
                        bankId: transaction.bankId,
                        description: transaction.description,
                        category: transaction.category,
                        currency: transaction.currency,
                        amount: transaction.amount,
                        status: IStatus.Pending,
                        date: new Date()
                    });

                    const updatingAccountModel: IAccount = {
                        accountId: accountData.accountId,
                        balance: transaction.amount,
                        userId: accountData.userId,
                        type: accountData.type
                    };

                    await accountService.patch('/account', updatingAccountModel);

                    return result;
                }
            }

        } catch (error) {
            logger.error("error with create transaction", error);
        }
    }
}