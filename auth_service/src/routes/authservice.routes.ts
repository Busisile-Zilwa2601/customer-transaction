import express from "express";
import { AuthController } from "../controller/auth_controller";

const auth_controller = new AuthController();
const router = express.Router();

export default(): express.Router => {
    
    router.post('/register', (req: express.Request, res: express.Response) => auth_controller.register(req, res));
    router.post('/login', (req: express.Request, res: express.Response) => auth_controller.login(req, res));
    router.post('/refresh-token', (req: express.Request, res: express.Response) => auth_controller.userRefreshToken(req, res));
    router.post('/logout', (req: express.Request, res: express.Response) => auth_controller.logout(req, res));
    
    return router;
}
