import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { IAccountModel } from '../models/account.model';
import { AccountService } from '../service/account.service';
import { IAccountType } from '../interface/account_interface';

export class AccountController {
    private account_service: AccountService;

    constructor() {
        this.account_service = new AccountService();
    }

    getAccount = async (req: Request, res: Response): Promise<any> => {
        try {
            const userId = req.user?.userId;
            if(!userId)
            {
                logger.error("Unauthorized")
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const accountId = (req.params.accountid).trim().toString();

            if(!accountId || accountId.trim().length === 0) {
                logger.warn('Validation error: AccountId is missing');
                return res.status(400).json({
                    success: false, 
                    message: 'Validation error: AccountId is missing'
                });
            }

            const data =  await this.account_service.getAccount(accountId);
            logger.info(`Successfully retrived Account ${accountId}`);
            res.status(200).json({
                success: true,
                data
            });

        } catch (error) {
            logger.error('Fail on retrieving Account', error)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    updateAccount = async (req: Request, res: Response): Promise<any> =>{
        try {
            const {userId, accountId, balance, type} = req.body;
            console.log("Coming Req: ", req.body);
            const data =  await this.account_service.getAccount(accountId);

            if(!data)
            {
                logger.warn('Account not Found');
                return res.status(400).json({
                    success: false, 
                    message: 'Account not Found'
                });
            }
            let updatedBalance = balance + data.balance;
            console.log("apdating balance: ", updatedBalance);
            const updateData: Partial<IAccountModel> = {
                accountId: accountId,
                userId: userId,
                balance : updatedBalance,
                type: (IAccountType as any)[type],
                createdAt: data.createdAt,
                updatedAt: new Date()
            };

            await this.account_service.updateAccount(updateData);

            logger.info(`Successfully Updated Account ${accountId}`);
            res.status(204).json({
                success: true,
                message: `Successfully Updated Account ${accountId}`
            });
        } catch (error) {
            logger.error('Fail on updating Account', error)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

