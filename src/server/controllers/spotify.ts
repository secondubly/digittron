import type { FastifyReply, FastifyRequest } from 'fastify'
import { RequestContext } from '@mikro-orm/core'
import { Token } from '@lib/db/models/token.entity'
import type { SpotifyAccessToken } from '@lib/core/types'
import redisClient from '@lib/utils/redis'
import type {
    getTokenParams,
    UpdateTokenInput,
    UpdateTokenParams,
} from '../schemas/spotify.js'
import { log } from '@lib/utils/logger'

export async function getSpotifyToken(
    request: FastifyRequest<{
        Params: getTokenParams
    }>,
    reply: FastifyReply,
) {
    const { id } = request.params
    const token = await getAccessToken(id)

    if (!token) {
        reply.code(404).send({ error: 'Token not found' })
        return
    } else if (!token.refresh_token) {
        reply
            .code(422)
            .send({ error: 'No refresh token attached to access token' })
        return
    }

    if (!redisClient.isOpen) {
        await redisClient.connect()
    }

    await redisClient.set(`spotify_${id}`, JSON.stringify(token))
    reply.code(200).send(token)

    return
}

export async function putSpotifyToken(
    request: FastifyRequest<{
        Params: UpdateTokenParams
        Body: UpdateTokenInput
    }>,
    reply: FastifyReply,
) {
    const { id } = request.params
    const token = request.body

    const em = RequestContext.getEntityManager()
    if (!em) {
        throw new Error('Could not retrieve entity manager')
    }
    const tokensTable = em.getRepository(Token)
    const oldToken = await tokensTable.findOne(
        { id: parseInt(id) },
        {
            fields: ['spotifyAccessToken'],
        },
    )

    if (!oldToken) {
        reply.code(404).send({
            message: 'Could not find token matching given ID',
        })
        return
    }

    // REVIEW: check to make sure we're storing the right value
    oldToken.spotifyAccessToken = token.access_token
    em.flush()
    await redisClient.set(`spotify_${id}`, JSON.stringify(token))

    reply.code(204).send()
}

async function getAccessToken(id: string): Promise<SpotifyAccessToken | null> {
    const em = RequestContext.getEntityManager()
    if (!em) {
        throw new Error('Could not retrieve entity manager')
    }
    const tokensTable = em.getRepository(Token)

    const token = await tokensTable.findOne(
        { id: parseInt(id) },
        {
            fields: ['spotifyAccessToken'],
        },
    )

    if (!token || !token.spotifyAccessToken) {
        return null
    }

    const spotifyAccessToken: SpotifyAccessToken = JSON.parse(
        token.spotifyAccessToken,
    )

    log.api.debug(
        `spotify access token: ${JSON.stringify(spotifyAccessToken, null, '\t')}`,
    )
    return spotifyAccessToken
}
