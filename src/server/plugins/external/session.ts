import fp from 'fastify-plugin'
import fastifySession from '@fastify/session'
import { config } from '@core/config/env'
import { RedisStore } from 'connect-redis'

const SESSION_TTL_S = 7 * 24 * 60 * 60 // 7 days
const SESSION_TTL_MS = SESSION_TTL_S * 1000

export default fp(
  async (fastify) => {
    await fastify.register(fastifySession, {
      secret: config.SESSION_SECRET,
      store: new RedisStore({
        // store session data in redis so it persists between restarts
        client: fastify.redis,
        prefix: 'session:',
        ttl: SESSION_TTL_S,
      }),
      cookie: {
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS, // 7 days in milliseconds
      },
      // saves space and complies with EU GDPR
      saveUninitialized: false,
      rolling: true, // resets the TTL on every request, so users are only loggged out after 30 consecutive days
    })
  },
  { name: 'session', dependencies: ['cookie', 'tokenStore'] },
)
