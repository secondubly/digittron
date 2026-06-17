import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { config } from 'src/config/env'

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get(
        '/health',
        {
            // don't print logs for this endpoint because it's just for testing
            config: {
                disableRequestLogging: true,
            },
        },
        async function () {
            return {
                status: 'ok',
                uptime: process.uptime(),
                env: config.NODE_ENV,
                timestamp: Date.now(),
                bot: fastify.bot?.isRunning() ?? false,
            }
        },
    )
}

export default plugin
