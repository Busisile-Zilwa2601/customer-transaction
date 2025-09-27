import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshToken, IRefreshToken } from '../models/refreshToken';
import { IAuthModel } from '../models/identity';
import dotenv from 'dotenv';
import { DocumentNotFoundError } from './custom_error';

dotenv.config();
const secret = process.env.JWT_SECRET as string;

export const generateToken = async(user: IAuthModel) => {
    const accessToken = jwt.sign({
        userId: user.id,
        username: user.username
    }, secret, {expiresIn: '60min'});
    
    await RefreshToken.deleteMany({user: user.id});
    
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await RefreshToken.create({
        token: refreshToken,
        user: user.id,
        expiresAt
    });

    return { accessToken, refreshToken }
}

export const getRefreshTokenById = async(id: string): Promise<IRefreshToken> => {
    const storedToken = await RefreshToken.findOne({user: id}); 
    if(!storedToken) {
        throw new DocumentNotFoundError("Refresh token not found");
    } 
    return storedToken; 
}

export const getRefreshToken = async(token: string): Promise<IRefreshToken> => {
    const storedToken = await RefreshToken.findOne({token: token});

    if(!storedToken) {
        throw new DocumentNotFoundError("Refresh token not found");
    }
    return storedToken;
};

export const deleteRefreshToken = async(token: string) => {
    await RefreshToken.deleteOne({token});
}

export const deleteRefreshTokenById = async(id: string)=> {
    await RefreshToken.findOneAndDelete({user: id});
}