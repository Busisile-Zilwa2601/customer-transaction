import mongoose from "mongoose";
import { logger } from "../utils/logger";
import dotenv from 'dotenv';
dotenv.config();

let uri: string | undefined;

switch(process.env.NODE_ENV)
{
    case "production":
        uri = process.env.MONGODB_URI_PROD;
        break;
    default:
        uri = process.env.MONGODB_URI_DEV
        break;
}

if(!uri)
{
    logger.error("No MongoDb Connection String available in the env variables");
    process.exit(1);
}

export async function connectDB():Promise<void> {
    try {
        await mongoose.connect(uri!);
        logger.info('MONGODB Successfully connected!!!');
    } catch (error) {
        logger.error("MongoDB connection error:", error);
        process.exit(1); // Exit app if connection fails
    }
}