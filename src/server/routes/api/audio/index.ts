import { log } from '@lib/services/logger'
import type { FastifyPluginAsync } from 'fastify'

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        '/events',
        {
            sse: true,
        },
        async (request, reply) => {
            reply.raw.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no', // disable nginx buffering
            })

            reply.raw.write('event: connected\ndata: {"status":"ok"}\n\n')

            const keepAlive = setInterval(() => {
                reply.raw.write(': ping\n\n')
            }, 30_000)

            const send = (event: string, data: unknown) => {
                reply.raw.write(
                    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
                )
            }

            // attach event listener
            fastify.bot.on('firstMessage', (data) => send('firstMessage', data))

            request.raw.on('close', () => {
                clearInterval(keepAlive)
                log.api.info('SSE client disconnected')
            })

            await new Promise<void>((resolve) =>
                request.raw.on('close', resolve),
            )
        },
    )
}

export default plugin
