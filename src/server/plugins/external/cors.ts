import cors, { type FastifyCorsOptions } from '@fastify/cors'

export const autoConfig: FastifyCorsOptions = {
    origin: (origin, cb) => {
        if (
            !origin ||
            /localhost:5000/.test(origin) ||
            /localhost:5001/.test(origin) ||
            /localhost:4000/.test(origin)
        ) {
            cb(null, true)
            return
        }

        cb(new Error('Not allowed'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

export default cors
