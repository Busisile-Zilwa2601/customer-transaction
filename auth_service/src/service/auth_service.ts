import crypto from 'crypto';
import { random, authentication, verifyPassword } from '../utils/helpers';
import { logger } from '../utils/logger';
import { CustomError } from '../utils/custom_error';
import { AuthContext } from "../context/auth_context";
import { IUser, Role } from "../interfaces/auth_interface";
import { AuthModel } from '../models/identity';
import { generateToken, getRefreshToken, deleteRefreshToken, deleteRefreshTokenById } from "../utils/generateToken";
//import { publishEvent } from '../middleware/rabbitMq';

export class AuthService {
    private auth_context: AuthContext;

    constructor(){
        this.auth_context = new AuthContext();
    }
    
    createUser = async(values: IUser): Promise<any> => {
        
        const salt = random();
        const hashPassword = authentication(values.password, salt);
        const user = new AuthModel({
            id: crypto.randomUUID(),
            // accountId: crypto.randomUUID(),
            // role: values.role ?? Role.client,
            firstname: values.firstname,
            lastname: values.lastname,
            username: values.username,
            email: values.email,
            authentication: {
                password: hashPassword,
                salt: salt
            }
        });

        const savedUser = await this.auth_context.createUser(user);
        if(!savedUser)
        {
            logger.error('Unable to save the user: ', user.username);
            throw new Error(`Unable to save the user: ${user.username}`);
        }
        
        const {accessToken, refreshToken } = await generateToken(savedUser);
        
        //let clientName = `${savedUser.firstname} ${savedUser.lastname}`;
        // await publishEvent('user.register', {
        //     email: savedUser.email,
        //     clientname: clientName,
        //     template: 'User Registration'
        // });

        let user_id = savedUser.id
        return { accessToken, refreshToken, user_id};
    }

    checkEmailExtance = async(email: string): Promise<boolean> => {
        const exisitngEmail = await  this.auth_context.getUserByEmail(email);
        if(exisitngEmail){
            return true
        }else {
            return false;
        }
    }

    getUserByEmail = async (email: string): Promise<any> => {
        const user = await this.auth_context.getUserByEmail(email);
        return user
    }

    loginUser = async (identifier: string, password: string): Promise<any> => {
        const user = await this.auth_context.getUser(identifier).select('+authentication.password +authentication.salt');

        if(!user) {
           logger.warn('User not found', identifier);
            throw new Error('User not found');
        }
     
        const isValid = verifyPassword(password, user.authentication.salt, user.authentication.password);
        if(!isValid) {
            throw new Error("Invalid password");
        }

        const {accessToken, refreshToken } = await generateToken(user);

        return {
            accessToken, 
            refreshToken,
            user: {
                username: user.username,
                email: user.email
            }
        };
    }

    refreshUserToken = async (token: string): Promise<any>=> {
        const storedToken = await getRefreshToken(token);

        if(!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn('Invalid or expired refresh token');
            let errorInfo = {
                success: false,
                status: 401
            }
            throw new CustomError("Invalid or expired refresh token", errorInfo);
        }

        
        let userModel = await this.auth_context.getUserById(storedToken.user);
        if(!userModel){
            logger.warn('User not found');
            let errorInfo = {
                success: false,
                status: 401
            }
            throw new CustomError("User not found", errorInfo);
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(userModel);
        await deleteRefreshToken(storedToken.token);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            userId: userModel.id
        }
    }

    logoutUser = async (refreshToken: string): Promise<void> => {
        const storedToken = await getRefreshToken(refreshToken); 
        
        
        if(!storedToken) {
            logger.error('Invalid or expired refresh token');
            let errorInfo = {
                success: false,
                status: 401
            }
            throw new CustomError("Invalid or expired refresh token", errorInfo);
        }
        let user = await this.auth_context.getUserById(storedToken.user);
       
        if(!user)
        {
            logger.error('User not found');
            let errorInfo = {
                success: false,
                status: 404
            };
            throw new CustomError("User not found", errorInfo);
        }
        
        await deleteRefreshTokenById(user.id);
    }
}