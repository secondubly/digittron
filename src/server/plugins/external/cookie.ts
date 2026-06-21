import { config } from '@core/config/env'
import { fastifyCookie } from '@fastify/cookie'
import fp from 'fastify-plugin'

export default fp(
  async (fastify) => {
    fastify.register(fastifyCookie, {
      secret: config.COOKIE_SECRET, // used to sign cookies
      hook: 'onRequest',
    })
  },
  { name: 'cookie' },
)
