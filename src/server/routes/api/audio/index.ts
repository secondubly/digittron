import { AudioAlert } from '@core/db/models/audio_alert.entity'
import { log } from '@core/utils/logger'
import type { FastifyPluginAsync } from 'fastify'
import {
    deleteFile,
    getFile,
    updateFile,
    uploadFile,
} from '@server/controllers/audio'
import {
    audioIdSchema,
    audioOptionsSchema,
    filenameSchema,
    uploadFileSchema,
} from '@server/schemas/audio_alerts'

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

    fastify.get('/alerts', async (req, reply) => {
        if (!req.isAuthenticated()) return reply.code(401).send()

        const alerts = await req.em.find(
            AudioAlert,
            { owner: { owner: req.user?.id } },
            { orderBy: { chatterName: 'asc' } },
        )

        return { alerts }
    })

    fastify.post(
        '/alerts',
        {
            schema: {
                body: uploadFileSchema,
            },
        },
        uploadFile,
    )

    fastify.patch(
        'alerts/:id',
        {
            schema: {
                params: audioIdSchema,
                body: audioOptionsSchema,
            },
        },
        updateFile,
    )

    fastify.delete(
        '/alerts/:id',
        {
            schema: {
                params: audioIdSchema,
            },
        },
        deleteFile,
    )

    fastify.get(
        '/alerts/:filename',
        {
            schema: filenameSchema,
        },
        getFile,
    )
}

export default plugin
