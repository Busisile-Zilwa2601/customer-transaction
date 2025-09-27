import ampq, { Channel, ChannelModel } from 'amqplib';
import { logger } from '../utils/logger';

let connection: ChannelModel;
let channel: Channel;

interface ConsumeEventCallback {
    (msg: ampq.ConsumeMessage | null): void;
}

const EXCHANGE_NAME = "Bank_Transactions";

export async function connect() {
    try {
        
        connection = await ampq.connect(process.env.RABBITMQ_URL as string);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', {durable: false})
        logger.info("Connected to RabbitMq");
        return channel;

    } catch (error) {
        logger.error("Error connection to rabbitmq", error);
    }
}

export async function consumeEvent(routingKey: string, callBack: ConsumeEventCallback): Promise<void> {
    if (!channel) {
        await connect();
    }

    const theQueue = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(theQueue.queue, EXCHANGE_NAME, routingKey);
    channel.consume(theQueue.queue, (msg: ampq.ConsumeMessage | null) => {
        if(msg != null) {
            const content = JSON.parse(msg.content.toString());
            callBack(content);
            channel.ack(msg);
        }
    });
    logger.info(`Subscribed to event ${routingKey}`);
}

export async function publishEvent(routingKey:string, message: any)
{
    try {
        if(!channel) 
        {
            await connect();
        }
        logger.info(`Message: ${JSON.stringify(message)}`);
        await channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
        logger.info(`Event published: ${routingKey}`);
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error("Failed to send message");
    }
}