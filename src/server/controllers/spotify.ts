import type { FastifyReply, FastifyRequest } from 'fastify'
import { RequestContext } from '@mikro-orm/core'
import { Token } from '@lib/db/models/token.entity'
import type { SpotifyAccessToken } from '@lib/core/types'
import redisClient from '@lib/utils/redis'
import type {
    callbackQuerySchema,
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

export async function handleSpotifyCallback(
    request: FastifyRequest<{
        Querystring: callbackQuerySchema
    }>,
    reply: FastifyReply,
) {
    const code = request.query.code
    const state = request.query.state

    if (!state) {
        reply.redirect('/#' + JSON.stringify('error: state mismatch'))
        return
    }

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: 'http://127.0.0.1:4000/api/spotify/callback',
            grant_type: 'authorization_code',
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization:
                'Basic ' +
                Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID +
                        ':' +
                        process.env.SPOTIFY_CLIENT_SECRET,
                ).toString('base64'),
        },
    }

    const response = await fetch(authOptions.url, {
        method: 'POST',
        body: new URLSearchParams(authOptions.form),
        headers: authOptions.headers,
    })

    const data = await response.json()
    console.log(data)
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
