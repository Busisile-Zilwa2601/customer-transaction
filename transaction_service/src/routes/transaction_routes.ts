import express from 'express';
import { tokenRequest } from "../middleware/tokenHandler";
import { TransactionController } from '../controller/transaction_controller';

const transaction_controller = new TransactionController();

const router = express.Router();

export default(): express.Router => {

    router.get('/transactions', tokenRequest, (req: express.Request, res: express.Response)=> transaction_controller.getTransactions(req, res));
    router.put('/transation', tokenRequest, (req: express.Request, res: express.Response)=> transaction_controller.transaction(req, res));
    return router;
}