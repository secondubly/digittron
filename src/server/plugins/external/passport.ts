import fp from 'fastify-plugin'
import fastifyPassport from '@fastify/passport'
import {
    Strategy as TwitchStrategy,
    type TwitchProfile,
} from 'passport-twitch-new'
import { Strategy as SpotifyStrategy } from 'passport-spotify'
import { config } from 'src/config'
import { User } from '@lib/db/models/user.entity'
import type { FastifyRequest } from 'fastify'
import type { TokenStore } from '@lib/core/tokens/TokenStore'
import type { ThirdPartyTokenRecord } from '@lib/core/tokens/types'

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

// TODO: maybe make these config variables
const SPOTIFY_SCOPES = [
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-email',
    'user-read-playback-state',
    'user-read-private',
    'user-read-recently-played',
    'user-top-read',
    'streaming',
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
                    done: (
                        error?: Error | null,
                        user?: object,
                        info?: object,
                    ) => void,
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

        if (config.SPOTIFY_CLIENT_ID && config.SPOTIFY_CLIENT_SECRET)
            fastifyPassport.use(
                'spotify',
                new SpotifyStrategy(
                    {
                        clientID: config.SPOTIFY_CLIENT_ID,
                        clientSecret: config.SPOTIFY_CLIENT_SECRET,
                        callbackURL:
                            'http://127.0.0.1:4000/api/spotify/callback',
                        // TODO: possible make this a config variable
                        scope: SPOTIFY_SCOPES,
                    },
                    async (
                        accessToken,
                        refreshToken,
                        expires_in,
                        profile,
                        done,
                    ) => {
                        try {
                            // REVIEW: should we store by the spotify ID instead?
                            fastify.tokenStore.set(
                                `spotify:${config.TWITCH_BROADCASTER_ID}`,
                                {
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    expiresIn: expires_in, // 1 hour in seconds
                                    obtainedAt: Date.now(),
                                    scope: SPOTIFY_SCOPES.join(' '),
                                    userId: profile.id,
                                    provider: 'spotify',
                                } as ThirdPartyTokenRecord,
                            )
                            done(null)
                        } catch (err) {
                            done(err as Error, profile)
                        }
                    },
                ),
            )
    },
    { name: 'passport', dependencies: ['session', 'db'] },
)
