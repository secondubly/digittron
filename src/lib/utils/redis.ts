import logger from '../../logger.js'
import { createClient, RedisClientType, SocketTimeoutError } from 'redis'

const redisClient: RedisClientType = createClient({
    socket: {
        host:
            process.env.NODE_ENV === 'development'
                ? 'localhost'
                : process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        reconnectStrategy: (retries, cause) => {
            if (cause instanceof SocketTimeoutError) {
                return false
            }

            const maxRetries = 2 // retries 3 times
            if (retries > maxRetries) {
                logger.error('Too many retries. Connection terminated.')
                return new Error('Too many retries.')
            }

            // Generate a random jitter between 0 – 200 ms:
            const jitter = Math.floor(Math.random() * 200)
            // Delay is an exponential back off, (times^2) * 50 ms, with a maximum value of 2000 ms:
            const delay = Math.min(Math.pow(2, retries) * 50, 2000)

            logger.warn(
                `Retrying connection in ${delay / 1000} seconds (Attempt ${retries + 1} of ${maxRetries + 1})...`,
            )
            return delay + jitter
        },
    },
})

redisClient.on('connect', () => logger.info('Connected to redis'))
redisClient.on('error', (err) => logger.error('Redis Client Error', err))

export const connectRedis = async (): Promise<void> => {
    if (!redisClient.isOpen) {
        await redisClient.connect()
    }
}

export const disconnectRedis = async (): Promise<void> => {
    if (redisClient.isOpen) {
        await redisClient.destroy()
    }
}

export default redisClient
