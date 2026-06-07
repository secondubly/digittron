import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { createClient, type RedisClientType } from 'redis'
import { TokenStore } from '@lib/core/tokens/TokenStore'

interface TokenStorePluginOptions {
    redisUrl: string
}

export default fp(
    async (fastify: FastifyInstance, opts: TokenStorePluginOptions) => {
        const redis = createClient({ url: opts.redisUrl }) as RedisClientType

        redis.on('error', (err) => fastify.log.error({ err }, 'Redis error'))
        redis.on('connect', () => fastify.log.info('Redis connecting...'))
        redis.on('ready', () => fastify.log.info('Redis ready'))
        redis.on('reconnecting', () =>
            fastify.log.warn('Redis reconnecting...'),
        )

        await redis.connect()

        const tokenStore = new TokenStore(redis, fastify.orm) // app.db from your db plugin

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
