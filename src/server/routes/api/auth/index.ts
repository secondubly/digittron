import type { FastifyPluginAsync } from 'fastify'
import fastifyPassport from '@fastify/passport'
import {
  TWITCH_BOT_SCOPE_STRING,
  TWITCH_BROADCASTER_SCOPE_STRING,
} from '@core/config/scopes'
import { config } from '@core/config/env'
import type { ThirdPartyTokenRecord } from '@core/tokens/types'

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async function (_req, reply) {
    reply.send('/auth endpoint hit')
  })

  fastify.get(
    '/twitch/login',
    {
      preValidation: fastifyPassport.authenticate('twitch', {
        scope: TWITCH_BROADCASTER_SCOPE_STRING,
      }),
    },
    async () => {},
  )

  fastify.get(
    '/twitch/bot-login',
    {
      preValidation: fastifyPassport.authenticate('twitch', {
        // @ts-expect-error(ignore call error, false positive)
        forceVerify: true,
        scope: TWITCH_BOT_SCOPE_STRING,
      }),
    },
    async () => {},
  )

  fastify.get(
    '/twitch/callback',
    {
      preValidation: fastifyPassport.authenticate('twitch', {
        failureRedirect: `${config.CLIENT_URL}/?error=twitch_failed`,
      }),
    },
    async (_request, reply) => {
      /**
                if spotify info is present, we should set the refresh token proactively
                this is used for everyone, whether they're logged in or not
            */
      if (config.SPOTIFY_CLIENT_ID && config.SPOTIFY_CLIENT_SECRET) {
        const spotifyToken: ThirdPartyTokenRecord | null =
          await fastify.tokenStore.get(
            `spotify:${config.TWITCH_BROADCASTER_ID}`,
          )

        if (spotifyToken && spotifyToken.refreshToken) {
          reply.setCookie('spotify_refresh_token', spotifyToken.refreshToken, {
            httpOnly: true, // not accessible via document.cookie
            secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
            sameSite: 'lax', // CSRF protection
            path: '/',
            maxAge: 60 * 60 * 24 * 60, // 60 days
            signed: true, // HMAC-signed with COOKIE_SECRET
          })
        }
      }
      // redirect after successful
      return reply.redirect(`${config.CLIENT_URL}/`)
    },
  )

  fastify.get('/me', async function (req, reply) {
    if (!req.user || !req.isAuthenticated()) {
      return reply.code(401).send({ user: null })
    }

    const user = req.user

    return {
      user: {
        id: user.twitch_id,
        username: user.username,
        avatar: user.avatar,
      },
    }
  })

  fastify.delete('/logout', async (req, reply) => {
    reply.clearCookie('spotify_refresh_token', { path: '/' })
    await req.logOut()
    return reply.send({ ok: true })
  })
}

export default plugin
