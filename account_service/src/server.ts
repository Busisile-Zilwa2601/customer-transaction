import express from 'express';
import helmet from "helmet";
import cors from 'cors';
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { handleAccountCreated } from "./utils/event_handler";
import router from "./routes/account.routes";
import { errorHandler } from "./middleware/errorHandler";
import { connect, consumeEvent, publishEvent } from "./middleware/messagingSevice";
import { connectDB } from "./context/db";
import { accountMock } from "./mockData/account_mock";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
});

//Main routes
app.use('/api/account/', router());

//Error handler
app.use(errorHandler);

const startServer = async ()=>{
    try {
        await connectDB();
        
        await connect();
        
        await consumeEvent('account.create', handleAccountCreated);
        
        if(process.env.NODE_ENV == 'development'){
            await publishEvent('account.create', accountMock)
            .then(()=>{
                logger.info("Mock account creation event published");
            })
            .catch((err)=>{
                logger.error("Failed to publish mock account creation event", err);
            });
        }

        app.listen(PORT, ()=>{
            logger.info(`AccountService is running on port ${PORT}`);
        });

    } catch (error) {
        logger.error("Failed to connnec to server", error);
        process.exit(1)
    }
}

startServer();

//unhandled promise rejection
process.on('unhandledRejection', (reason, promise)=>{
    logger.error('unhandled Rejection', promise, reason);
});