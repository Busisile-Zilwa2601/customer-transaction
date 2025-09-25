import Joi from "joi";
import { IUser, ILogin } from '../interfaces/auth_interface';


export const validateRegistration = (data: IUser) => {
    const schema = Joi.object<IUser>({
        firstname: Joi.string().min(3).max(70).required(),
        lastname: Joi.string().min(3).max(70).required(),
        username: Joi.string().min(3).max(70).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(data);
}

export const validateLogin = (data: ILogin) => {
    const schema = Joi.object<ILogin>({
        identifier: Joi.string().required()
            .custom((value, helpers)=> {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(value);
                if (!isEmail && !isUsername) {
                    return helpers.error('any.invalid');
                  }
                  return value;
            })
            .messages({
                'any.invalid': 'Identifier must be a valid email or username'
            }),
        password: Joi.string().min(8).required()
    });
    return schema.validate(data);
}