import express from 'express';
import helmet from "helmet";
import cors from 'cors';
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import router from "./routes/transaction_routes";
import { errorHandler } from "./middleware/errorHandler";
import { connect } from "./middleware/messagingSevice";
import { connectDB } from "./context/db";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

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
app.use('/api/transaction/', router());

//Error handler
app.use(errorHandler);

const startServer = async ()=>{
    try {
        await connect();
        await connectDB();
        app.listen(PORT, ()=>{
            logger.info(`Authservice is running on port ${PORT}`);
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