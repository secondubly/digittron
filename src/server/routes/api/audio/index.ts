import { AudioAlert } from '@core/db/models/audio_alert.entity'
import { log } from '@core/utils/logger'
import type { FastifyPluginAsync } from 'fastify'
import { deleteFile, getFile, updateFile, uploadFile } from '@server/controllers/audio'
import { audioIdSchema, audioOptionsSchema, filenameSchema } from '@server/schemas/audio_alerts'
import type { FirstMessageEvent } from '@root/src/bot/types'

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/events',
    {
      sse: true,
    },
    async (request, reply) => {
      reply.raw.writeHead(200, {
        'Access-Control-Allow-Credentials': 'true', // TODO: remove before release
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        // TODO:L remove before release
        'Access-Control-Allow-Origin': request.headers.origin ?? 'http://localhost:5000',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // disable nginx buffering
      })

      reply.raw.write('event: connected\ndata: {"status":"ok"}\n\n')

      const keepAlive = setInterval(() => {
        reply.raw.write(': ping\n\n')
      }, 30_000)

      const send = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      }

      // attach event listener
      if (!fastify.bot) return
      // REVIEW: check this
      fastify.bot.on('firstMessage', (data: FirstMessageEvent) => send('firstMessage', data))

      request.raw.on('close', () => {
        clearInterval(keepAlive)
        log.api.info('SSE client disconnected')
      })

      await new Promise<void>((resolve) => request.raw.on('close', resolve))

      return reply
    },
  )

  fastify.get('/alerts', async (req, reply) => {
    if (!req.user || !req.isAuthenticated()) return reply.code(401).send()

    const alerts = await req.em.find(
      AudioAlert,
      { owner: { twitch_id: req.user.twitch_id } },
      { orderBy: { chatterName: 'asc' } },
    )

    return { alerts }
  })

  fastify.post(
    '/alerts',
    {
      bodyLimit: 26_214_400, // ~25 MB in bytes
      schema: {
        body: { type: 'null' }, // tells Fastify not to validate the body
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
