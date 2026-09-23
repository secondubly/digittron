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
  return {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
    transport: {
      target: 'pino-pretty',
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Translate time to system's local time
        ignore: 'pid,hostname,service',
      },
    },
  }
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
      if (err) {
        server.log.error(err)
      }

      await server.orm.close()
      await server.close()
    },
  )

  await server.ready()

  return server
}
