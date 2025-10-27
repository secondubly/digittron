import pino from 'pino'

const logger = pino({
    level: process.env.NOD_ENV === 'production' ? 'info' : 'debug',
})

export default logger
