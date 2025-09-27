import dotenv from 'dotenv';
import Redis from "ioredis";
dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL as string);

export class CacheService {
    
    static async get<T>(key: string): Promise<T | null> {
        
        const data = await redisClient.get(key);

        return data ? JSON.parse(data) : null;
    }

    static async set<T>(key: string, value: T): Promise<void>{
        await redisClient.set(key, JSON.stringify(value), 'EX', 3600);
    }

    static async del(user: string): Promise<void> {
        const key = `transactions:${user}:*`;
        if(key.length > 0)
        {
            await redisClient.del(key);
        }
    }
}