import { logger } from "./logger";
import { TransactionModel } from "../models/Transation";
import { IAccountType, IStatus } from "../intefaces/ITransaction";
import * as crypto from "crypto";


interface TransactionEvent {
    transactionId: string;
    accountId: string;
    externalId: string;
    bankId: string;
    currency: string;
    category: string;
    subCategory?: string;
    originalDescription: string;
    description: string;
    date: string;
    postDate?: string;
    createdAt?: string;
    type: string;
    status: string;
    amount: number;
    metadata?: Record<string, any>;
    reference?: string;
    paymentMethod?: string;
    merchantId?: string;
    merchantName?: string;
    locationInfo?: {
    address?: string;
    city?: string;
    country?: string;
  };
}

export async function handleTransaction(event: any): Promise<void> {
    try {
        const existingTransaction = event.transactionId ? await TransactionModel.findOne({ transactionId: event.transactionId }) : null;
        if (existingTransaction) {
            logger.warning(`Transaction already exists`, { transactionId: event.transactionId });
            return;
        }

        const newTransaction = new TransactionModel({
            transactionId: event.transactionId ?? crypto.randomUUID(),
            accountId: event.accountId,
            externalId: event.externalId,
            bankId: event.bankId,
            currency: event.currency,
            category: event.category,
            subCategory: event.subCategory ?? undefined,
            originalDescription: event.originalDescription,
            description: event.description,
            date: event.date,
            postDate: event.postDate ? event.postDate : undefined,
            type: (IAccountType as any)[event.type],
            status: (IStatus as any)[event.status],
            amount: event.amount,
            createdAt: event.createdAt ? event.createdAt : new Date(),
            metadata: event.metadata ?? undefined,
            reference: event.reference ?? undefined,
            paymentMethod: event.paymentMethod ?? undefined,
            marchantId: event.merchantId ?? undefined,
            marchantName: event.merchantName ?? undefined,
            locationInfo: event.locationInfo ?? undefined,
        });

        const savedTransaction = await newTransaction.save();
        
        logger.info(`Transaction saved successfully`, { transactionId: savedTransaction.transactionId });
    } catch (error: any) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            logger.warn(`Transaction creation failed due to duplicate key`, {
                transactionId: event.transactionId,
                error: error.message,
                details: error.keyValue, // Log the duplicate key value
            });
        } else {
            logger.error(`Account creation failed`, {
                transactionId: event.transactionId,
                error: error.message,
                stack: error.stack,
                event: event // Log the full event for debugging
            });
        }
    }
}