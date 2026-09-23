import pino, { type Logger } from 'pino'

let logger: Logger

const formatting_opts = {
  colorize: true,
  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Translate time to system's local time
  messageFormat: '[{service}] {msg}',
  ignore: 'pid,hostname,service',
}

logger = pino()
if (process.env.NODE_ENV === 'development') {
  logger = pino({
    transport: {
      target: 'pino-pretty',
      options: formatting_opts,
    },
    level: 'debug',
  })
} else {
  logger = pino({
    level: 'info',
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    transport: {
      target: 'pino-pretty',
      options: formatting_opts,
    },
  })
}

export const log = {
  bot: logger.child({ service: 'BOT' }),
  api: logger.child({ service: 'API' }),
  web: logger.child({ service: 'WEB' }),
  app: logger,
}
