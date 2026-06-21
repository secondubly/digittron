import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { createClient, type RedisClientType } from 'redis'
import { TokenStore } from '@core/tokens/TokenStore'

interface TokenStorePluginOptions {
  redisUrl: string
}

export default fp(
  async (fastify: FastifyInstance, opts: TokenStorePluginOptions) => {
    const redis = createClient({
      url: opts.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error('Redis connection failed: Max retries reached.')
            throw new Error('Max retries reached') // Stops reconnection attempts
          }

          // Explicitly wait 1000ms (1 second) between remaining attempts
          return 1000
        },
      },
    }) as RedisClientType

    redis.on('error', (err) => fastify.log.error({ err }, 'Redis error'))
    redis.on('connect', () => fastify.log.info('Redis connecting...'))
    redis.on('ready', () => fastify.log.info('Redis ready'))
    redis.on('reconnecting', () => fastify.log.warn('Redis reconnecting...'))

    await redis.connect()

    const tokenStore = new TokenStore(redis, fastify.orm.em) // app.db from your db plugin

    fastify.decorate('redis', redis)
    fastify.decorate('tokenStore', tokenStore)

    // ── Teardown ────────────────────────────────────────────────────────────────
    fastify.addHook('onClose', async () => {
      fastify.log.info('Closing Redis connection...')
      await redis.destroy()
    })
  },
  {
    name: 'tokenStore',
    dependencies: ['db'], // ensures db plugin is registered first
  },
)
