import express from "express";
import { logger } from '../utils/logger';
import { validateRegistration, validateLogin } from "../utils/validate";
import { AuthService } from '../service/auth_service';
import { IUser } from '../interfaces/auth_interface';
import { publishEvent } from "../middleware/messagingSevice";

export class AuthController {
    private auth_service: AuthService;

    constructor() {
        this.auth_service = new AuthService();
    }

    register = async (req: express.Request, res: express.Response): Promise<any> => {
        logger.info('hitting the registration endpoint');
        try {
    
            //validite user schema
            const { error } = validateRegistration(req.body)
            if(error){
                logger.warn('Validation error', error.details[0].message);
                return res.status(400).json({
                    success: false, 
                    message: error.details[0].message
                });
            }

            const { firstname, lastname, username, email, password } = req.body;
            let checkUser = await this.auth_service.checkEmailExtance(email);
            if(checkUser){
                logger.warn('User already Exists');
                return res.status(400).json({
                    success: false,
                    message: 'User already Exists'
                })
            };

            let newUser: IUser = {
                firstname,
                lastname,
                username,
                email,
                password
            };

            const {accessToken, refreshToken, user_id} = await this.auth_service.createUser(newUser);
            logger.info(`User successfully created id: ${user_id}`);
            
            await publishEvent('account.create', {
                userId: user_id,
                createdAt: Date.now
            });

            return res.status(201).json({
                success: true,
                message: 'User successfully created',
                accessToken,
                refreshToken
            });
        } catch (error) {
            logger.error('Registration error occured', error)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    login = async (req: express.Request, res: express.Response): Promise<any> =>{
        logger.info("hitting the login endpoint");
        try {
            const { error, value } = validateLogin(req.body);
            if(error) {
                logger.warn('Validation error', error.details[0].message);
                return res.status(400).json({
                    success: false, 
                    message: error.details[0].message
                });
            }
            console.log("value", value);

            const { identifier, password } = value;
            const results = await this.auth_service.loginUser(identifier, password);

            res.status(200).json({
                accessToken: results.accessToken,
                refreshToken: results.refreshToken,
                userInfo: results.user
            })

        } catch (error) {
            logger.error('Login error occured', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    userRefreshToken = async (req: express.Request, res: express.Response): Promise<any> => {
        logger.info('refresh token endpoint hit');
        try {
            const { refreshToken } = req.body;
            if(!refreshToken)
            {
                logger.warn('Refresh Token missing');
                return res.status(400).json({
                    sucess: false,
                    message: 'Refresh Token not available'
                });
            }
            
            const results  = await this.auth_service.refreshUserToken(refreshToken);
           logger.info("Token refreshed for userId: ", results.userId)
            res.status(200).json({
                success: true,
                message: "Token Refresh Successfully",
                accessToken: results.accessToken,
                refreshToken: results.refreshToken
            });

        } catch (error) {
            logger.error('Refresh Token error occured', error)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    logout = async (req: express.Request, res: express.Response): Promise<any> => {
        logger.info("Logout endpoint hit");
        try {
            const {refreshToken} =  req.body;
            if(!refreshToken){
                logger.warn("Refresh Token missing");
                return res.status(400).json({
                    success: false,
                    message: "Refresh Token missing"
                });
            }

            await this.auth_service.logoutUser(refreshToken);
            logger.info("Remove refresh token for logging out");
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
            
        } catch (error) {
            logger.error('Error occured while logging out', error)
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}