import { createCustomCommand } from '@server/controllers/commands'
import type { FastifyPluginAsync } from 'fastify'

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', createCustomCommand)
}

export default plugin
