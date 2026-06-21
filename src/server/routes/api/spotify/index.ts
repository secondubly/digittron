import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fastifyPassport from '@fastify/passport'
import { getTokenParamsSchema } from '@server/schemas/spotify'
import { getToken, refreshToken } from '@server/controllers/spotify'
import { config } from '@core/config/env'

const plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get(
    '/login',
    {
      preValidation: fastifyPassport.authenticate('spotify'),
    },
    async () => {},
  )

  fastify.get(
    '/callback',
    {
      preValidation: fastifyPassport.authenticate('spotify', {
        failureRedirect: `${config.CLIENT_URL}/spotify_login?error=spotify_failed`,
      }),
    },
    async (_request, reply) => {
      const token = await fastify.tokenStore.get(
        `spotify:${config.TWITCH_BROADCASTER_ID}`,
      )

      reply.setCookie('spotify_refresh_token', token.refresh_token, {
        httpOnly: true, // not accessible via document.cookie
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'lax', // CSRF protection
        path: '/',
        maxAge: 60 * 60 * 24 * 60, // 60 days
        signed: true, // HMAC-signed with COOKIE_SECRET
      })
      reply.redirect('/')
    },
  )

  fastify.get(
    '/token/:id',
    {
      schema: {
        params: getTokenParamsSchema,
      },
    },
    getToken(fastify),
  )

  fastify.post('/token', refreshToken(fastify))
}

export default plugin
