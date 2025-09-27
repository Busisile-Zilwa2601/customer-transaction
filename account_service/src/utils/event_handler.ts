import * as crypto from 'crypto';
import { logger } from "./logger";
import { IAccountType } from "../interface/account_interface";
import { AccountModel } from '../models/account.model';

export async function handleAccountCreated(event: any):Promise<void> {
    try {
        const accountId =  event.accountId ?? crypto.randomUUID();
        const newAccount = new AccountModel({
            userId: event.userId,
            accountId: accountId,
            balance: event.balance ?? 0,
            type: event.type ?? IAccountType.Debit,
            createdAt: event.createdAt
        });

        await newAccount.save();
        logger.info(`Account created successfully`, { userId: event.userId, accountId: accountId });
        
    }catch(err: any){
        if (err.name === 'MongoServerError' && err.code === 11000) {
            logger.warn(`Account creation failed due to duplicate key`, {
                userId: event.userId,
                error: err.message,
                details: err.keyValue, // Log the duplicate key value
            });
        } else {
            // Log other types of errors with a more severe log level (e.g., 'error')
            // Ensure the relevant context (like the userId) is included
            logger.error(`Account creation failed`, {
                userId: event.userId,
                error: err.message,
                stack: err.stack,
                event: event // Log the full event for debugging
            });
        }
    }
}
