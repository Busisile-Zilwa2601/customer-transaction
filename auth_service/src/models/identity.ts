import mongoose from "mongoose";
import { Role } from "../interfaces/auth_interface";

export interface IAuthModel extends mongoose.Document {
    id: string,
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    role: Role,
    accountId: string,
    authentication: {
        password: string;
        salt: string;
        sessionToken: string;
    },
    createdAt: Date
}

const authSchema = new mongoose.Schema<IAuthModel>({
    id: {
        type: String, 
        required: true, 
        unique: true
    },
    // accountId: {
    //     type: String, 
    //     required: true, 
    //     unique: true
    // },
    // role: {
    //     type: String,
    //     enum: Object.values(Role) as string[],
    //     required:false,
    //     default: Role.client
    // },
    firstname: {
        type: String,
        required: true, 
        trim: true
    },
    lastname: {
        type: String, 
        required: true, 
        trim: true
    },
    username: {
        type: String,
        required: true, 
        unique: true, 
        trim: true
    },
    email:{
        type: String, 
        required: true, 
        unique: true, 
        trim: true
    },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

authSchema.index({id: 'text', username: 'text', email: 'text'});

export const AuthModel = mongoose.model<IAuthModel>("Auth_Collection", authSchema);