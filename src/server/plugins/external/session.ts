import fp from 'fastify-plugin'
import fastifySession from '@fastify/session'
import { config } from 'src/config'
// import { RedisStore } from 'connect-redis'

export default fp(
    async (fastify) => {
        await fastify.register(fastifySession, {
            secret: config.SESSION_SECRET,
            // store: new RedisStore({
            //     client: fastify.tokenStore.redis,
            //     prefix: 'session',
            // }),
            cookie: {
                secure: config.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            },
            // saves space and complies with EU GDPR
            saveUninitialized: false,
        })
    },
    { name: 'session', dependencies: ['cookie'] },
)
