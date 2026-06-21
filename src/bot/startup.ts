import { TokenStore } from '@core/tokens/TokenStore'
import { log } from '@core/utils/logger'
import { MikroORM } from '@mikro-orm/core'
import type { SqlEntityManager, SqliteDriver } from '@mikro-orm/sqlite'
import { createClient, type RedisClientType } from 'redis'
import { Bot } from '../bot/bot'
import { config } from '@core/config/env'
import mikroOrmConfig from '../mikro-orm.config'

export async function startBot(): Promise<Bot> {
  log.bot.info('Starting bot in standalone mode...')

  const orm = await MikroORM.init<SqliteDriver>(mikroOrmConfig)
  const em = orm.em.fork() as SqlEntityManager<SqliteDriver>
  log.bot.info('Database connected')

  const redis: RedisClientType = createClient({ url: config.REDIS_URL })
  redis.on('error', (err) => log.bot.error({ err }, 'Redis error'))
  await redis.connect()
  log.bot.info('Redis connected')

  const tokenStore = new TokenStore(redis, em)
  log.bot.info('TokenStore initialized')

  const bot = new Bot(config.TWITCH_CHANNELS, tokenStore)

  const shutdown = async (signal: string) => {
    log.bot.info(`Received ${signal} — shutting down...`)

    const timeout = setTimeout(() => {
      log.bot.error('Shutdown timed out — forcing exit')
      process.exit(1)
    }, 5_000)

    try {
      await bot.stop()
      await redis.destroy()
      await orm.close()
      clearTimeout(timeout)
      log.bot.info('Bot shut down cleanly')
      process.exit(0)
    } catch (err) {
      clearTimeout(timeout)
      log.bot.error({ err }, 'Error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  process.on('uncaughtException', async (err) => {
    log.bot.error({ err }, 'Uncaught exception')
    await shutdown('uncaughtException')
  })

  process.on('unhandledRejection', async (reason) => {
    log.bot.error({ reason }, 'Unhandled rejection')
    await shutdown('unhandledRejection')
  })

  await bot.start()
  log.bot.info('🤖  Bot running in standalone mode')

  return bot
}
