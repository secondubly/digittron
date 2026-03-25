import cors, { type FastifyCorsOptions } from '@fastify/cors'

export const autoConfig: FastifyCorsOptions = {
    origin: (origin, cb) => {
        if (
            !origin ||
            /localhost:5000/.test(origin) ||
            /localhost:5001/.test(origin) ||
            /192.168.1.\d+/.test(origin)
        ) {
            cb(null, true)
            return
        }

        cb(new Error('Not allowed'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // TODO: set condition to only use in development
}

export default cors
