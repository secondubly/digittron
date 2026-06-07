import type { FastifyReply, FastifyRequest } from 'fastify'
import { RequestContext, wrap } from '@mikro-orm/core'
import { Token } from '@lib/db/models/token.entity'
import redisClient from '@lib/services/redis'
import {
    TokenSchema,
    type callbackQuerySchema,
    type getTokenParams,
} from '../schemas/spotify.js'
import { log } from '@lib/services/logger.js'
import { Value } from '@sinclair/typebox/value'

export async function getToken(
    request: FastifyRequest<{
        Params: getTokenParams
    }>,
    reply: FastifyReply,
) {
    const { id } = request.params
    if (!redisClient.isOpen) {
        await redisClient.connect()
    }

    let token = await redisClient.get(`${id}_spotify_token`)

    if (!token) {
        const refreshToken = await redisClient.get(
            `${id}_spotify_refresh_token`,
        )

        if (!refreshToken) {
            return reply.send(404)
        }

        const newToken = await generateNewToken(refreshToken)

        if (typeof newToken === 'number') {
            return reply.send(newToken).send()
        } else {
            redisClient.set(`${id}_spotify_token`, newToken, {
                expiration: {
                    type: 'EX',
                    value: 3600,
                },
            })
            token = newToken
        }
    }

    return reply.code(200).send(token)
}

export async function handleCallback(
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

    if (!redisClient.isOpen) {
        await redisClient.connect()
    }

    let spotifyToken = null
    const data = await response.json()
    spotifyToken = Value.Parse(TokenSchema, data)
    // store access token in redis cache, store refresh token in both DB and cache
    redisClient.set(
        `${process.env.TWITCH_ID}_spotify_token`,
        spotifyToken.access_token,
        {
            expiration: {
                type: 'EX',
                value: 3600,
            },
        },
    )

    redisClient.set(
        `${process.env.TWITCH_ID}_spotify_refresh_token`,
        spotifyToken.refresh_token || '',
    )

    const em = RequestContext.getEntityManager()
    if (!em) {
        log.api.error('Could not retrieve entity manager')
        reply.code(500).send()
        return
    }

    if (spotifyToken.refresh_token) {
        redisClient.set(
            `${process.env.TWITCH_ID}_spotify`,
            spotifyToken.refresh_token,
        )

        const record = await em.findOne(Token, {
            id: Number(process.env.TWITCH_ID),
        })
        if (record) {
            wrap(record).assign({
                spotifyRefreshToken: spotifyToken.refresh_token,
            })
        } else {
            em.create(Token, {
                id: Number(process.env.TWITCH_ID),
                twitchAccessToken: '',
                spotifyRefreshToken: spotifyToken.refresh_token,
            })
        }

        await em.flush()
    }
}

const generateNewToken = async (token: string): Promise<string | number> => {
    const encodedAuth = Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET,
    ).toString('base64')

    const refreshOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: token,
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + encodedAuth,
        },
        json: true,
    }

    const response = await fetch(refreshOptions.url, {
        method: 'POST',
        body: new URLSearchParams(refreshOptions.form),
        headers: refreshOptions.headers,
    })

    if (!response.ok) {
        log.api.error(response)
        return response.status
    }

    const data = await response.json()
    const newToken = Value.Parse(TokenSchema, data)

    return newToken.access_token
}
