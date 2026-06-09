import {
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from 'fastify'
import type {
    CallbackSchemaType,
    LoginSchemaType,
    TwitchTokenInputParams,
    TwitchTokenQuery,
} from '../schemas/twitch'
import { RequestContext } from '@mikro-orm/core'
// import { Token } from '@lib/db/models/token.entity'
import { exchangeCode, type AccessToken } from '@twurple/auth'
import { config } from 'src/config'
import type { HelixUser } from '@twurple/api'
import { log } from '@lib/services/logger'
import crypto from 'node:crypto'

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

export async function getTwitchToken(
    request: FastifyRequest<{
        Params: TwitchTokenInputParams
        Querystring: TwitchTokenQuery
    }>,
    reply: FastifyReply,
) {
    const { id } = request.params
    const { scopes } = request.query

    const token = await getToken(id, scopes)

    if (!token) {
        reply.code(404).send({ error: 'Token not found' })
    } else {
        let accessToken
        if (scopes) {
            accessToken = {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                scope: scopes.split(','),
                expiresIn: 0,
                obtainmentTimestamp: 0,
            } as AccessToken
        } else {
            accessToken = {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: 0,
                obtainmentTimestamp: 0,
            } as AccessToken
        }

        reply.code(200).send(accessToken)
    }

    return
}

async function getToken(id: string, scopes?: string) {
    const em = RequestContext.getEntityManager()
    if (!em) {
        throw new Error('Could not retrieve entity manager')
    }
    const scopesArray = scopes ? scopes.split(',') : undefined
    const tokensTable = em.getRepository(Token)

    const token = await tokensTable.findOne(parseInt(id), {
        fields: ['twitchAccessToken'],
    })

    if (!token || !token.twitchAccessToken) {
        return null
    }

    let accessToken: AccessToken
    if (scopesArray) {
        accessToken = JSON.parse(token.twitchAccessToken) as AccessToken
        accessToken.scope = scopesArray
    } else {
        accessToken = JSON.parse(token.twitchAccessToken) as AccessToken
    }

    return accessToken
}

async function getTwitchUser(accessToken: string): Promise<HelixUser> {
    const res = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': config.TWITCH_CLIENT_ID,
        },
    })

    if (!res.ok) throw new Error(`Failed to fetch Twitch user: ${res.status}`)

    const { data } = await res.json()
    return data[0] as HelixUser
}

export function handleCallback(server: FastifyInstance) {
    return async (
        request: FastifyRequest<{
            Querystring: CallbackSchemaType
        }>,
        reply: FastifyReply,
    ) => {
        const { code, state } = request.query
        if (!state) {
            reply.redirect('/#' + JSON.stringify('error: state mismatch'))
            return
        }

        const tokenData = await exchangeCode(
            config.TWITCH_CLIENT_ID,
            config.TWITCH_CLIENT_SECRET,
            code,
            'http://localhost:4000/api/twitch/callback', // TODO: move this to a config variable or similar
        )

        const twitchUser = await getTwitchUser(tokenData.accessToken)

        if (twitchUser.id === config.TWITCH_BOT_ID) {
            await server.tokenStore.set('token:bot', tokenData)
            // request.em.upsert(Token, {
            //     id: Number(config.TWITCH_BOT_ID),
            //     twitchAccessToken: JSON.stringify(tokenData),
            // })
        } else if (twitchUser.id === config.TWITCH_BROADCASTER_ID) {
            await server.tokenStore.set('token:broadcaster', tokenData)
            // request.em.upsert(Token, {
            //     id: Number(config.TWITCH_BROADCASTER_ID),
            //     twitchAccessToken: JSON.stringify(tokenData),
            // })
        } else {
            log.api.warn('Got back an invalid user for the associated token')
            return reply.code(500).send({ error: 'Internal Server Error' })
        }
    }
}

export function handleLogin(server: FastifyInstance) {
    return async (
        request: FastifyRequest<{
            Querystring: LoginSchemaType
        }>,
        reply: FastifyReply,
    ) => {
        const { type } = request.query
        const state = crypto.randomBytes(32).toString('hex')
        // TODO: store redirect uri in variable
        const authOptions = {
            url: 'http://id.twitch.tv/oauth2/authorize',
            redirect_uri: 'http://localhost:4000/api/twitch/callback',
            response_type: 'code',
            state,
            scope: encodeURIComponent(
                type === 'bot'
                    ? BOT_SCOPES.join(' ')
                    : BROADCASTER_SCOPES.join(' '),
            ),
        }

        const url =
            'https://id.twitch.tv/oauth/authorize?redirect_uri=' +
            authOptions.redirect_uri +
            '&response_type=code' +
            '&state=' +
            state +
            '&scope=' +
            authOptions.scope +
            '&force_verify=true'

        server.tokenStore.set(`state:${type}`, state)

        return reply.redirect(url)
    }
}
