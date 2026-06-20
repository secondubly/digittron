import fp from 'fastify-plugin'
import fastifyPassport from '@fastify/passport'
import {
    Strategy as TwitchStrategy,
    type TwitchProfile,
} from 'passport-twitch-new'
import {
    Strategy as SpotifyStrategy,
    type Profile as SpotifyProfile,
    type VerifyCallback,
} from 'passport-spotify'
import { config } from '@core/config/env'
import { User } from '@core/db/models/user.entity'
import type { FastifyRequest } from 'fastify'
import type { TokenStore } from '@core/tokens/TokenStore'
import type { ThirdPartyTokenRecord } from '@core/tokens/types'
import {
    SPOTIFY_SCOPE_STRING,
    SPOTIFY_SCOPES,
    TWITCH_BOT_SCOPE_STRING,
    TWITCH_BROADCASTER_SCOPE_STRING,
} from '@core/config/scopes'

export default fp(
    async (fastify) => {
        await fastify.register(fastifyPassport.initialize())
        await fastify.register(fastifyPassport.secureSession())

        // what gets stored in the session
        fastifyPassport.registerUserSerializer(async (user: User) => {
            return user.twitch_id
        })

        // what gets loaded from the session on each request
        fastifyPassport.registerUserDeserializer(async (id: number, req) => {
            const user = await req.em.findOne(
                User,
                {
                    twitch_id: id.toString(),
                },
                {
                    fields: ['twitch_id', 'username', 'avatar'],
                },
            )
            if (!user) {
                return
            } else {
                return user
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

                        // notify bot that a token has been set (so we can continue startup)
                        fastify.authWaiter.notify(`twitch:${profile.id}`)
                        // only create login sessions for a non-bot account
                        if (profile.id === config.TWITCH_BROADCASTER_ID) {
                            const user = (await request.em.findOne(User, {
                                twitch_id: profile.id,
                            })) as User
                            // object that is passed to registerUserSerializer
                            done(null, user)
                        } else {
                            done(null)
                        }
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
                        // @ts-expect-error(ignore call error, false positive)
                        scope: SPOTIFY_SCOPES,
                    },
                    async (
                        accessToken: string,
                        refreshToken: string,
                        expires_in: number,
                        profile: SpotifyProfile,
                        done: VerifyCallback,
                    ) => {
                        try {
                            fastify.tokenStore.set(
                                `spotify:${config.TWITCH_BROADCASTER_ID}`,
                                {
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    expiresIn: expires_in, // 1 hour in seconds
                                    obtainedAt: Date.now(),
                                    scope: SPOTIFY_SCOPE_STRING,
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

async function upsertUser(
    req: FastifyRequest,
    tokenStore: TokenStore,
    data: TwitchProfile,
) {
    req.log.debug(`Called in lifecycle: ${req.url}`)
    if (!data._access_token || !data._refresh_token) {
        throw Error('Missing values in token data')
    }

    await tokenStore.set(`twitch:${data.id}`, {
        twitchId: data.id,
        accessToken: data._access_token,
        refreshToken: data._refresh_token,
        expiresIn: data._expires_in,
        obtainedAt: Date.now(),
        scope:
            data.id === config.TWITCH_BROADCASTER_ID
                ? TWITCH_BROADCASTER_SCOPE_STRING
                : TWITCH_BOT_SCOPE_STRING,
        username: data.login,
        avatar: data.profile_image_url,
        provider: 'twitch',
    })
}
