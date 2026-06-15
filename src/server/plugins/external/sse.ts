import fastifySSE, { type SSEPluginOptions } from '@fastify/sse'

export const autoConfig: SSEPluginOptions = {
    serializer: (data) => JSON.stringify(data),
}

export default fastifySSE
