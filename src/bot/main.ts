import { log } from '@lib/services/logger'
import { config } from 'src/config'

import { createClient, type RedisClientType } from 'redis'
import { TokenStore } from '@lib/core/tokens/TokenStore.js'
import { MikroORM } from '@mikro-orm/sqlite'
import mikroOrmConfig from 'src/mikro-orm.config'
import { init } from '@lib/utils'

async function createTokenStore() {
    const redis = createClient({ url: config.REDIS_URL }) as RedisClientType

    redis.on('error', (err) => log.app.error({ err }, 'Redis error'))
    redis.on('connect', () => log.app.info('Redis connecting...'))
    redis.on('ready', () => log.app.info('Redis ready'))
    redis.on('reconnecting', () => log.app.warn('Redis reconnecting...'))

    const orm = await MikroORM.init(mikroOrmConfig)

    const tokenStore = new TokenStore(redis, orm.em.fork())
    tokenStore.connect()
    return tokenStore
}

const startup = async () => {
    if (config.NODE_ENV === 'development') {
        log.bot.info('Running in development mode')
    }

    const tokenStore = await createTokenStore()
    init(config.TWITCH_CHANNELS, tokenStore)
}

// only used when spinning up the bot by itself
if (import.meta.main) {
    startup().catch((err) => {
        log.bot.error(`Failed to start bot: ${err}`)
    })
}
