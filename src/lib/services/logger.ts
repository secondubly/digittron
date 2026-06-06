import pino, { type Logger } from 'pino'

let logger: Logger
logger = pino()
if (process.env.NODE_ENV === 'development') {
    logger = pino({
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Translate time to system's local time
                ignore: 'pid,hostname',
            },
        },
        level: 'debug',
    })
} else {
    logger = pino({
        level: 'info',
    })
}

export const log = {
    bot: logger.child({ service: 'BOT' }),
    api: logger.child({ service: 'API' }),
    web: logger.child({ service: 'WEB' }),
    app: logger,
}
