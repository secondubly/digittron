import cors, { type FastifyCorsOptions } from '@fastify/cors'
import { config } from 'src/config'

export const autoConfig: FastifyCorsOptions = {
    origin: (origin, cb) => {
        if (
            !origin ||
            /localhost:5000/.test(origin) ||
            /localhost:5001/.test(origin) ||
            /localhost:4000/.test(origin) ||
            /192.168.1.\d+/.test(origin)
        ) {
            cb(null, true)
            return
        }

        cb(new Error('Not allowed'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: config.NODE_ENV === 'development' ? true : false,
}

export default cors
