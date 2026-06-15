import type { FastifyPluginAsync } from 'fastify'

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        '/events',
        {
            sse: true,
        },
        async (_request, reply) => {
            reply.sse.send({ data: 'Hello, SSE!' })
        },
    )
}

export default plugin
