import express from 'express';
import { authenticateRequest } from '../middleware/authenticate';
import { AccountController } from "../controllers/account_controller";

const account_controller = new AccountController();

const router = express.Router();

export default(): express.Router => {
    
    router.get('/get/:accountid', authenticateRequest,(req:express.Request, res: express.Response)=> account_controller.getAccount(req, res));
    router.patch('/account', (req:express.Request, res: express.Response)=> account_controller.updateAccount(req, res));
    return router;
}