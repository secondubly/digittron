import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { Bot } from 'src/bot/bot'
import { config } from 'src/config/env'

export default fp(
    async (server: FastifyInstance) => {
        // ✅ tokenStore already exists on app — registered by tokenStore plugin
        const bot = new Bot(
            config.TWITCH_CHANNELS,
            server.tokenStore, // ← passed here
        )

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
        dependencies: ['tokenStore'],
    },
)
