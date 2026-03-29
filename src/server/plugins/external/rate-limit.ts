import fastifyRateLimit from '@fastify/rate-limit'
import { type FastifyInstance } from 'fastify'

export const autoConfig = (fastify: FastifyInstance) => {
    return {
        // any IP can make at most 4 requests per minute
        max: process.env.RATE_LIMIT_MAX,
        timeWindow: '1 minute',
    }
}

/**
 * @see {@link https://github.com/fastify/fastify-rate-limit}
 */
export default fastifyRateLimit
