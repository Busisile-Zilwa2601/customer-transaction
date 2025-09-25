import mongoose from "mongoose";

export interface IRefreshToken extends mongoose.Document {
    token: string;
    user: string;
    expiresAt: Date;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user : {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {timestamps: true});

refreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

export const RefreshToken = mongoose.model<IRefreshToken>('Auth_Token', refreshTokenSchema);