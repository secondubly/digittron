import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
    TwitchTokenInputParams,
    TwitchTokenQuery,
} from '../schemas/twitch'
import { RequestContext } from '@mikro-orm/core'
import { Token } from '@lib/db/models/token.entity'
import type { AccessToken } from '@twurple/auth'

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
