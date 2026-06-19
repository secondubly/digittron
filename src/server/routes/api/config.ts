import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { SCOPES } from '@core/config/scopes'

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get('/config/scopes', async () => SCOPES)
}

export default plugin
