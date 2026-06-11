import fp from 'fastify-plugin'
import fastifyPassport from '@fastify/passport'
import {
    Strategy as TwitchStrategy,
    type TwitchProfile,
} from 'passport-twitch-new'
import { config } from 'src/config'
import { User } from '@lib/db/models/user.entity'
import type { FastifyRequest } from 'fastify'
import type { TokenStore } from '@lib/core/tokens/TokenStore'

async function upsertUser(
    req: FastifyRequest,
    tokenStore: TokenStore,
    data: TwitchProfile,
) {
    req.log.debug(`Called in lifecycle: ${req.url}`)
    if (!data._access_token || !data._refresh_token) {
        throw Error('Missing values in token data')
    }

    const user = await req.em.findOne(User, {
        twitch_id: data.id,
    })

    if (!user) {
        await tokenStore.setTwitch(data.id, {
            twitchId: data.id,
            accessToken: data._access_token,
            refreshToken: data._refresh_token,
            expiresIn: data._expires_in,
            obtainedAt: Date.now(),
            scope: BROADCASTER_SCOPES.join(' '),
            username: data.login,
            avatar: data.profile_image_url,
        })
    } else {
        user.username = data.login
        user.avatar = data.profile_image_url
        await req.em.flush()
    }
}

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

export default fp(
    async (fastify) => {
        await fastify.register(fastifyPassport.initialize())
        await fastify.register(fastifyPassport.secureSession())

        // what gets stored in the session
        fastifyPassport.registerUserSerializer(async (user: TwitchProfile) => {
            return user.id
        })

        // what gets loaded from the session on each request
        fastifyPassport.registerUserDeserializer(async (id: number, req) => {
            const user = await req.em.findOne(User, {
                twitch_id: id.toString(),
            })
            if (!user) {
                return
            } else {
                return {
                    id: user.twitch_id,
                    displayName: user.username,
                    profile_image_url: user.avatar,
                }
            }
        })

        fastifyPassport.use(
            'twitch',
            new TwitchStrategy(
                {
                    clientID: config.TWITCH_CLIENT_ID,
                    clientSecret: config.TWITCH_CLIENT_SECRET,
                    callbackURL:
                        'http://localhost:4000/api/auth/twitch/callback',
                    scope: BROADCASTER_SCOPES,
                    passReqToCallback: true,
                },
                async (
                    request: FastifyRequest,
                    accessToken: string,
                    refreshToken: string,
                    profile: TwitchProfile,
                    done,
                ) => {
                    try {
                        profile._access_token = accessToken
                        profile._refresh_token = refreshToken
                        profile._expires_in = 14_400 // 4 hours in seconds

                        // handle db updates here instead of the route
                        await upsertUser(request, fastify.tokenStore, profile)

                        // automaticaly calls session login, so we don't need to
                        done(null, {
                            id: profile.id,
                            displayName: profile.login,
                            avatarUrl: profile.profile_image_url,
                        })
                    } catch (err) {
                        done(err as Error)
                    }
                },
            ),
        )
    },
    { name: 'passport', dependencies: ['session', 'db'] },
)
