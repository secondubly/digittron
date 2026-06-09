import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import fastifyPassport from '@fastify/passport'
import { User } from '@lib/db/models/user.entity'
import type { TokenStore } from '@lib/core/tokens/TokenStore'
import crypto from 'crypto'
import { config } from 'src/config'

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

interface TwitchUserData {
    _access_token: string | null
    _refresh_token: string | null
    _expires_in: number | null
    id: string
    login: string
    display_name: string
    type: 'staff' | 'admin' | 'global_mod' | ''
    broadcaster_type: 'partner' | 'affiliate' | ''
    description: string
    profile_image_url: string
    offline_image_url: string
    view_count: number
    email?: string // Requires the 'user:read:email' scope
    created_at: string
}

const algorithm = 'aes-256-gcm'
const ENCRYPTION_KEY = config.ENCRYPTION_KEY
const IV_LENGTH = 12

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async function (_req, reply) {
        reply.send('/auth endpoint hit')
    })
    fastify.get(
        '/twitch/login',
        {
            preValidation: fastifyPassport.authenticate('twitch', {
                scope: BROADCASTER_SCOPES,
                forceVerify: true,
            } as any),
        },
        async () => {}, // passport redirects, so we don't need anything here
    )

    fastify.get(
        '/twitch/callback',
        {
            preValidation: fastifyPassport.authenticate('twitch', {
                failureRedirect: `http://localhost:4000?error=twitch_failed`,
            }),
        },
        async (request, reply) => {
            const profile = request.user as TwitchUserData

            await upsertUser(request, fastify.tokenStore, profile)

            return reply.redirect(`http://localhost:5000/`)
        },
    )

    fastify.get('/me', async function (req, reply) {
        if (!req.isAuthenticated()) {
            return reply.code(401).send({ user: null })
        }

        const user = req.user as User

        return {
            user: {
                id: user.twitch_id,
                displayName: user.username,
                avatarUrl: user.avatar,
            },
        }
    })

    fastify.delete('/logout', async (req, reply) => {
        await req.logOut()
        return reply.send({ ok: true })
    })
}

async function upsertUser(
    req: FastifyRequest,
    tokenStore: TokenStore,
    data: TwitchUserData,
) {
    let user = await req.em.findOne(User, {
        twitch_id: data.id,
    })

    // TODO: make sure that access and refresh token are present, otherrwise throw an error
    const encryptedAccessToken = encryptToken(data._access_token!)
    const encryptedRefreshToken = encryptToken(data._refresh_token!)
    const expiresAt = Date.now() + data._expires_in!

    if (!user) {
        user = req.em.create(User, {
            twitch_id: data.id,
            username: data.login,
            avatar: data.profile_image_url ?? null,
            access_token_encrypted: encryptedAccessToken,
            refresh_token_encrypted: encryptedRefreshToken,
            expires_at: expiresAt,
            scopes: BROADCASTER_SCOPES.join(','),
        })
    } else {
        user.username = data.login
        user.avatar = data.profile_image_url
    }

    await req.em.flush()

    // store token
    await tokenStore.set(`token:twitch:${data.id}`, {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresIn: data._expires_in,
        obtainedAt: Date.now(),
        scope: BROADCASTER_SCOPES,
    })

    // log user in — sets session
    await req.logIn({
        id: user.twitch_id,
        username: user.username,
        avatar: user.avatar,
    })
}

function encryptToken(token: string) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(
        algorithm,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        iv,
    )
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    // Return iv, authTag, and encrypted data concatenated (so it can be decrypted later)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

// USE this to get the decrypted access token
function decryptToken(text: string) {
    const [ivHex, tagHex, encryptedText] = text.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(tagHex, 'hex')
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        iv,
    )
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

export default plugin
