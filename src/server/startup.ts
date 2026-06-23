import Fastify from 'fastify'
import fp from 'fastify-plugin'
import closeWithGrace from 'close-with-grace'
import bootstrap from './build'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { config } from '@core/config/env'

interface ServerBuildOptions {
  withBot?: boolean
}

function getLoggerOptions() {
  if (process.stdout.isTTY && process.env.NODE_ENV === 'development') {
    return {
      level: 'trace',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:mm:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }
  }

  return { level: process.env.LOG_LEVEL ?? 'info' }
}

export async function init({ withBot = true }: ServerBuildOptions = {}) {
  const server = Fastify({
    logger: getLoggerOptions(),
    // these are recommended values based on best practices
    connectionTimeout: 120_000,
    requestTimeout: 60_000,
    keepAliveTimeout: 10_000,
    http: {
      headersTimeout: 15_000,
    },
  }).withTypeProvider<TypeBoxTypeProvider>()

  // used to determine whether to load bot plugin or not
  server.decorate('withBot', withBot)
  await server.register(
    fp(
      await bootstrap({
        redisUrl: config.REDIS_URL,
      }),
    ),
  ) // this must complete before we can access orm

  closeWithGrace(
    {
      delay: (process.env.FASTIFY_CLOSE_GRACE_DELAY as unknown as number) ?? 500,
    },
    async ({ err }) => {
      if (err != null) {
        server.log.error(err)
      }

      await server.orm.close()
      await server.close()
    },
  )

  await server.ready()

  try {
    if (process.stdout.isTTY) {
      server.log.info('Server running in development mode')
      server.listen({
        port: (process.env.API_PORT as unknown as number) ?? 4001,
      })
    } else {
      server.listen({
        port: (process.env.API_PORT as unknown as number) ?? 4001,
        host: '0.0.0.0',
      })
    }
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }

  return server
}
