import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get('/', {}, async function (_request, reply) {
        return reply.sendFile('index.html')
    })
}

export default plugin
