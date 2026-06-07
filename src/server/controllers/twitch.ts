import {
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from 'fastify'
import type {
    CallbackSchemaType,
    TwitchTokenInputParams,
    TwitchTokenQuery,
} from '../schemas/twitch'
import { RequestContext } from '@mikro-orm/core'
import { Token } from '@lib/db/models/token.entity'
import { exchangeCode, type AccessToken } from '@twurple/auth'
import { config } from 'src/config'
import type { HelixUser } from '@twurple/api'
import { log } from '@lib/services/logger'

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
        // TODO: build twitch_login page similar to Spotify_login page
        // if (!state) {
        //     reply.redirect('/#' + JSON.stringify('error: state mismatch'))
        //     return
        // }

        const tokenData = await exchangeCode(
            config.TWITCH_CLIENT_ID,
            config.TWITCH_CLIENT_SECRET,
            code,
            'http://localhost:4000/api/twitch/callback', // TODO: move this to a config variable or similar
        )

        const twitchUser = await getTwitchUser(tokenData.accessToken)

        if (twitchUser.id === config.TWITCH_BOT_ID) {
            await server.tokenStore.set('token:bot', tokenData)
            request.em.upsert(Token, {
                id: Number(config.TWITCH_BOT_ID),
                twitchAccessToken: JSON.stringify(tokenData),
            })
        } else if (twitchUser.id === config.TWITCH_BROADCASTER_ID) {
            await server.tokenStore.set('token:broadcaster', tokenData)
            request.em.upsert(Token, {
                id: Number(config.TWITCH_BROADCASTER_ID),
                twitchAccessToken: JSON.stringify(tokenData),
            })
        } else {
            log.api.warn('Got back an invalid user for the associated token')
            return reply.code(500).send({ error: 'Internal Server Error' })
        }
    }
}
