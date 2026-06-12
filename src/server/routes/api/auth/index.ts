import type { FastifyPluginAsync } from 'fastify'
import fastifyPassport from '@fastify/passport'
import type { TwitchProfile } from 'passport-twitch-new'

const BROADCASTER_SCOPES = [
    'bits:read',
    'channel:bot',
    'channel:read:ads',
    'channel:manage:broadcast',
    'channel:manage:polls',
    'channel:manage:predictions',
    'channel:manage:raids',
    'channel:manage:redemptions',
    'channel:manage:schedule',
    'channel:manage:videos',
    'channel:read:editors',
    'channel:read:hype_train',
    'channel:read:polls',
    'channel:read:predictions',
    'channel:read:redemptions',
    'channel:read:subscriptions',
    'channel:read:vips',
    'clips:edit',
    'moderation:read',
    'user:read:subscriptions',
]

const BOT_SCOPES = [
    'channel:edit:commercial',
    'channel:moderate',
    'chat:read',
    'chat:edit',
    'clips:edit',
    'moderator:manage:announcements',
    'moderator:manage:banned_users',
    'moderator:manage:blocked_terms',
    'moderator:manage:chat_messages',
    'moderator:manage:shoutouts',
    'moderator:manage:unban_requests',
    'moderator:manage:warnings',
    'moderator:read:chat_settings',
    'moderator:read:chatters',
    'moderator:read:followers',
    'moderator:read:moderators',
    'moderator:read:vips',
    'user:bot',
    'user:read:chat',
    'user:write:chat',
]

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async function (_req, reply) {
        reply.send('/auth endpoint hit')
    })

    fastify.get(
        '/twitch/login',
        {
            preValidation: fastifyPassport.authenticate('twitch', {
                scope: BROADCASTER_SCOPES,
            }),
        },
        async () => {},
    )

    fastify.get(
        '/twitch/bot-login',
        {
            preValidation: fastifyPassport.authenticate('twitch', {
                forceVerify: true,
                scope: BOT_SCOPES,
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
