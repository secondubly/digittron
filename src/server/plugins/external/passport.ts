import fp from 'fastify-plugin'
import fastifyPassport from '@fastify/passport'
import { Strategy } from 'passport-twitch-new'
import { config } from 'src/config'
import { User } from '@lib/db/models/user.entity'

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
        fastifyPassport.registerUserSerializer(async (user: User) => {
            if (user.id) {
                return user.id
            }

            return user.twitch_id
        })

        // what gets loaded from the session on each request
        fastifyPassport.registerUserDeserializer(async (id: number, req) => {
            return await req.em.findOne(User, { twitch_id: id.toString() })
        })

        fastifyPassport.use(
            'twitch',
            new Strategy(
                {
                    clientID: config.TWITCH_CLIENT_ID,
                    clientSecret: config.TWITCH_CLIENT_SECRET,
                    callbackURL:
                        'http://localhost:4000/api/auth/twitch/callback',
                    scope: BROADCASTER_SCOPES,
                },
                async (
                    accessToken: string,
                    refreshToken: string,
                    { expires_in },
                    profile,
                    done,
                ) => {
                    try {
                        // handled in route — pass tokens through profile
                        profile._access_token = accessToken
                        profile._refresh_token = refreshToken
                        profile._expires_in = expires_in
                        done(null, profile)
                    } catch (err) {
                        done(err as Error)
                    }
                },
            ),
        )
    },
    { name: 'passport', dependencies: ['session', 'db'] },
)
