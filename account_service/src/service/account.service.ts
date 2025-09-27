import { AccountModel, IAccountModel } from "../models/account.model";

export class AccountService {

    getAccount = async (accountId: string): Promise<IAccountModel> => {
        return await AccountModel.findOne({accountId}, {_id: 0}).exec().then(acc => acc?.toObject() as IAccountModel);
    }

    updateAccount = async (acc: Partial<IAccountModel>): Promise<void> => {
        await AccountModel.findOneAndUpdate({$or: [{accountId: acc.accountId}, {userId: acc.userId}]}, acc, {new : true});
    }
}