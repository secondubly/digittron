
import pino from 'pino'
import pretty from 'pino-pretty'

const isDev = Bun.env.NODE_ENV !== 'production'
const pinoLevels = ['fatal', 'error', 'warn', 'info', 'debug'] as const

const stream = pretty({
  colorize: true,
  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // local time instead of a raw timestamp
  ignore: 'pid,hostname,module',             // drop noisy fields, and the module key is shown in the message instead
  messageFormat: '[{module}] {msg}',         // prefix each line with its module
  singleLine: true,                          // extra fields go on the same line instead of below
})

export const logger = pino(
  {
    level: Bun.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    // keep secrets out of logs if a token object ever gets logged
    redact: {
      paths: ['accessToken', 'refreshToken', 'clientSecret', '*.accessToken', '*.refreshToken', '*.clientSecret'],
      censor: '[redacted]',
    },
  },
  stream
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