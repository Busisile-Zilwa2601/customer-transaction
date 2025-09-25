import express from 'express';
import { authenticateRequest } from '../middleware/authenticate';
import { TransactionController } from '../controller/transaction_controller'; 

const transaction_controller = new TransactionController();

const router = express.Router();

export default(): express.Router => {

    router.get('/transactions', authenticateRequest, (req: express.Request, res: express.Response)=> transaction_controller.getTransactions(req, res));

    return router;
}