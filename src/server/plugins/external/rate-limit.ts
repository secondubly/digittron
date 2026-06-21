import fastifyRateLimit from '@fastify/rate-limit'
import { type FastifyInstance } from 'fastify'
import { config } from '@core/config/env'

export const autoConfig = (_fastify: FastifyInstance) => {
  return {
    // any IP can make at most 4 requests per minute
    max: config.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
    ban: 3,
    skipOnError: true,
  }
}

/**
 * @see {@link https://github.com/fastify/fastify-rate-limit}
 */
export default fastifyRateLimit
