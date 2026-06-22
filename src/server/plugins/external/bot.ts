import fp from 'fastify-plugin'
import { Bot } from '../../../bot/bot'
import { config } from '@core/config/env'

export default fp(
  async (server) => {
    // tokenStore already exists on app — registered by tokenStore plugin
    const bot = new Bot(config.TWITCH_CHANNELS, server.tokenStore, server.authWaiter)

    if (server) server.decorate('bot', bot)
    // REVIEW: do we need this?
    server.decorate('registry', bot.commandRegistry)

    server.addHook('onReady', async () => {
      bot.start().catch((err) => {
        server.log.error({ err }, 'Bot failed to start')
      })
    })

    server.addHook('onClose', async () => bot.stop())
  },
  {
    name: 'bot',
    dependencies: ['authWaiter', 'tokenStore'],
  },
)
