import fastifySSE, { type SSEPluginOptions } from '@fastify/sse'

export const autoConfig = (): SSEPluginOptions => {
    return {}
}

export default fastifySSE
