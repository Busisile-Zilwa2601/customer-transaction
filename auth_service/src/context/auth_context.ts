import { AuthModel } from '../models/identity';

export class AuthContext {
    
    getUsers = () => AuthModel.find();

    getUser(identifier: string) {
        return AuthModel.findOne({ $or : [{email: identifier}, {username: identifier}]}).lean();
    }
    
    getUserByEmail(email: string) {
        return AuthModel.findOne({ email });
    }

    getUserBySessionToken = (sessionToken: string) => AuthModel.findOne({ "authentication.sessionToken": sessionToken });
    
    getUserById = (id: string) => AuthModel.findOne({id}).lean();

    createUser = (values: Record<string, any>) => 
        new AuthModel(values)
            .save()
            .then((user) => user.toObject());

    updaUserById = (id: string, values: Record<string, any>) => AuthModel.findByIdAndUpdate(id, values, { new: true })
        .then((user) => user?.toObject());

    deleteUserById = (id: string) => AuthModel.findByIdAndDelete(id)
        .then((user) => user?.toObject());

}