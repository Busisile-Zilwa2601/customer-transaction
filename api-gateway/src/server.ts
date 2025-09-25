import express  from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import proxy from "express-http-proxy";
import helmet from "helmet";
import Redis from "ioredis";
import RedisStore, { RedisReply } from "rate-limit-redis";
import { logger } from './utils/logger';
import { errorHandler } from "./middleware/errorHandler";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;
const redisClient = new Redis(process.env.REDIS_URL as string);

//middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

//Rate Limiter
const rateLimiter = rateLimit({
    windowMs: 15*60*1000,   //15min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler : (req : express.Request, res: express.Response) => {
        logger.warn(`Sensitive endpoints rate limit exceeded for Ip ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many request"
        });
    },
    store: new RedisStore({
        sendCommand: (command: string, ...args: string[]): Promise<RedisReply> => redisClient.call(command, ...args) as Promise<RedisReply>
    })
});

app.use(rateLimiter);

//create proxy options 
const proxyOptions = {
    proxyReqPathResolver : (req: express.Request) => {
        return req.originalUrl.replace(/^\/v1/, "/api")
    },

    proxyErrorHandler: (error: Error, res: express.Response, next: express.NextFunction) => {
        logger.error(`Proxy error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: `Internal service error: ${error.message}`
        });
    }
}

//Auth service proxy
app.use('/v1/auth', proxy(process.env.AUTH_SERVICE_URL as string, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"]="application/json";
        return proxyReqOpts
    },
    userResDecorator: ( proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response received from Authservice: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}));


app.use(errorHandler);

app.listen(PORT, ()=>{
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`AuthService is running on port ${process.env.AUTH_SERVICE_URL}`);
});
