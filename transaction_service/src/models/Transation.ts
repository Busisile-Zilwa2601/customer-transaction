import mongoose from "mongoose";
import { IAccountType, IStatus } from "../intefaces/ITransaction";

export interface ITransaction extends Document {
    accountId: string;
    bankId: string;
    currency: string;
    category: string;
    description: string;
    date: Date;
    type: IAccountType;
    status: IStatus;
    amount: number;
    createdAt: Date
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    accountId: { type: String, unique: true, required: true },
    bankId: { type: String, required: true },
    currency: { type: String, required: true },
    category: { type: String, required: true, index: true},
    description: { type: String, required: true },
    date: { type: Date, required: true , index: true},
    type: { 
        type: String,
        enum: Object.values(IAccountType) as string[]
    },
    status: { 
        type: Number,
        enum: Object.values(IStatus) as number[]
    },
    amount: {type: Number, required: true},
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

export const TransactionModel = mongoose.model<ITransaction>('Transaction_Collection', transactionSchema);

