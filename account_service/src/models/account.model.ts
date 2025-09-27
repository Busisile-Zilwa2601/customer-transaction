import mongoose from "mongoose";
import { IAccountType } from "../interface/account_interface";

export interface IAccountModel extends Document {
    userId: string,
    accountId: string,
    type: IAccountType
    balance: number;
    createdAt: Date,
    updatedAt: Date,
}

const accountSchema = new mongoose.Schema<IAccountModel>({
    userId: { type: String, required: true},
    accountId: {type: String, required: true, unique:true, index: true},
    type: { type: String, enum: Object.values(IAccountType) as string[] },
    balance: { type: Number, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
}, {timestamps: true});

export const AccountModel = mongoose.model<IAccountModel>("Account_Collection", accountSchema);

