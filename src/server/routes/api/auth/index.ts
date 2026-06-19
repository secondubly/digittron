import type { FastifyPluginAsync } from 'fastify'
import fastifyPassport from '@fastify/passport'
import type { TwitchProfile } from 'passport-twitch-new'
import {
    TWITCH_BOT_SCOPE_STRING,
    TWITCH_BROADCASTER_SCOPE_STRING,
} from '@core/config/scopes'

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
                failureRedirect: `/?error=twitch_failed`,
            }),
        },
        async (_request, reply) => {
            // redirect after successful
            return reply.redirect(`/`)
        },
    )

    fastify.get('/me', async function (req, reply) {
        if (!req.isAuthenticated()) {
            return reply.code(401).send({ user: null })
        }

        const user = req.user as TwitchProfile

        return {
            user: {
                id: user.id,
                displayName: user.displayName,
                avatar: user.profile_image_url,
            },
        }
    })

    fastify.delete('/logout', async (req, reply) => {
        await req.logOut()
        return reply.send({ ok: true })
    })
}

export default plugin
