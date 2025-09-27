import mongoose from "mongoose";
import { IAccountType, IStatus } from "../intefaces/ITransaction";

interface ILocationInfo {
    address?: string;
    city?: string;
    country?: string;
}

export interface ITransaction extends Document {
    transactionId: string;
    accountId: string;
    externalId: string;
    bankId: string;
    currency: string;
    category: string;
    subCategory?: string;
    originalDescription: string;
    description: string;
    date: Date;
    postDate?: Date;
    type: IAccountType;
    status: IStatus;
    amount: number;
    createdAt: Date;
    metadata: Record<string, any>;
    reference?: string;
    paymentMethod?: string;
    marchantId?: string;
    marchantName?: string;
    locationInfo?: ILocationInfo;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    transactionId: { type: String, required: true, unique: true },
    accountId: { type: String, required: true, index: true },
    externalId: { type: String, required: true },
    bankId: { type: String, required: true },
    currency: { type: String, required: true },
    category: { type: String, required: true, index: true},
    subCategory: { type: String },
    originalDescription: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true , index: true},
    postDate: { type: Date },
    type: { 
        type: String,
        enum: Object.values(IAccountType)
    },
    status: { 
        type: String,
        enum: Object.values(IStatus),
    },
    amount: {type: Number, required: true},
    createdAt: {
        type: Date,
        default: Date.now
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    paymentMethod: { type: String },
    marchantId: { type: String },
    marchantName: { type: String },
    locationInfo: {
        address: { type: String },
        city: { type: String },
        country: { type: String }
    }
}, {timestamps: true});

export const TransactionModel = mongoose.model<ITransaction>('Transaction_Collection', transactionSchema);

