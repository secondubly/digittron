import path from 'node:path'
import fastifyAutoload from '@fastify/autoload'
import type { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function bootstrap(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  delete opts.skipOverride
  /**
   * load external plugins first because the server may need them immediately
   */
  await fastify
    .register(fastifyAutoload, {
      dir: path.join(import.meta.dirname, 'plugins/external'),
      options: { ...opts },
      encapsulate: false,
      matchFilter: (pathToFile) => {
        if (pathToFile.endsWith('bot.ts') && !fastify.withBot) {
          return false
        }
        return true
      },
    })
    .after((err) => {
      if (err) throw err
      fastify.log.debug('All autoloaded plugins are loaded and ready!')
    })

  fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'routes'),
    autoHooks: true,
    cascadeHooks: true,
    options: { ...opts },
  })

  fastify.setErrorHandler((err: FastifyError, request, reply) => {
    fastify.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      'Unhandled error occurred',
    )

    reply.code(err.statusCode ?? 500)
    let message = 'Internal Server Error'
    if (err.statusCode && err.statusCode < 500) {
      message = err.message
    }

    return { message }
  })

  // An attacker could search for valid URLs if error handling is not rate limited.
  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 1,
        timeWindow: 500,
      }),
    },
    (request, reply) => {
      const knownPathPrefixes = ['/api/spotify/token', '/api/twitch/token']
      const matchesPartialPath = knownPathPrefixes.some((p) => request.url.startsWith(p))

      if (matchesPartialPath && request.method === 'GET') {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Missing required path parameters',
        })
      }
      request.log.warn(
        {
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
          },
        },
        'Resource not found, redirecting to index.html',
      )

      // return reply.code(404).send({
      //   statusCode: 404,
      //   error: 'Not Found',
      //   message: `Route ${request.method}:${request.url} not found`,
      // })

      reply.sendFile('index.html')
    },
  )

  console.log('bootstrap end')
}
