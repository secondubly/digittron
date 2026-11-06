import type { LoggerInterface } from 'arcscord'
import pino, { type Logger } from 'pino'
import pretty from 'pino-pretty'

const isDev = Bun.env.NODE_ENV === 'development'
const pinoLevels = ['fatal', 'error', 'warn', 'info', 'debug'] as const

const stream = pretty({
  colorize: true,
  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // local time instead of a raw timestamp
  ignore: 'pid,hostname,module', // drop noisy fields, and the module key is shown in the message instead
  messageFormat: '[{module}] {msg}', // prefix each line with its module
  singleLine: true, // extra fields go on the same line instead of below
})

const logger = pino(
  {
    level: Bun.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    // keep secrets out of logs if a token object ever gets logged
    redact: {
      paths: [
        'accessToken',
        'refreshToken',
        'clientSecret',
        '*.accessToken',
        '*.refreshToken',
        '*.clientSecret',
      ],
      censor: '[redacted]',
    },
  },
  stream,
)

export const makeLogger = (module: string) => logger.child({ module })

export function twurpleLogger(name: string) {
  const log = makeLogger(name)
  return {
    custom: (level: number, message: string) => {
      const method = pinoLevels[level] ?? 'trace' // anything past debug (7) maps to trace
      log[method](message)
    },
  }
}

export function discordLogger(instance: Logger): LoggerInterface {
  return {
    trace: (message, meta) => instance.trace(meta ?? {}, message),
    debug: (message, meta) =>
      instance.debug(meta ?? {}, typeof message === 'string' ? message : message.join(' : ')),
    info: (message, meta) => instance.info(meta ?? {}, message),
    warn: (message, meta) => instance.warn(meta ?? {}, message),
    error: (message, meta) => instance.error(meta ?? {}, message),
    logError: (error, meta) => instance.error({ err: error, ...meta }, 'an error occurred'),
    fatal: (message, meta) => instance.fatal(meta ?? {}, message),
    fatalError: (error, meta) => instance.fatal({ err: error, ...meta }, 'a fatal error occurred'),
    log: (level, message, meta) => instance[level](meta ?? {}, message),
    child: (bindings) => discordLogger(instance.child(bindings)),
  }
}

export const log = {
  discord: discordLogger(makeLogger('discord')),
  twitch: makeLogger('bot'),
  api: makeLogger('api'),
  app: makeLogger('app'),
  web: makeLogger('web'),
}
