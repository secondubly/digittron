import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { log } from '@core/utils/logger.js'
import { type getTokenParams } from '../schemas/spotify.js'
import type { ThirdPartyTokenRecord, TokenRecord } from '@core/tokens/types.js'
import { config } from '@core/config/env.js'
import { SPOTIFY_SCOPE_STRING } from '@core/config/scopes.js'
// import { config } from 'src/config.js'

export function getToken(server: FastifyInstance) {
    return async (
        request: FastifyRequest<{
            Params: getTokenParams
        }>,
        reply: FastifyReply,
    ) => {
        const { id } = request.params

        const token = (await server.tokenStore.get(
            `spotify:${id}`,
        )) as TokenRecord

        if (!token) {
            log.bot.warn(`No token for spotify:${id} — re-auth required`)
            return reply
                .status(4041)
                .send({ error: 'Token not found, please reauthenticate.' })
        }

        /**
         * if token is invalid, just refresh it here
         */

        const res = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
        })

        if (!res.ok) {
            if (!token.refreshToken) {
                log.bot.warn(
                    `Existing token invalid for spotify:${id} — re-auth required`,
                )
                return reply.status(401).send({
                    error: 'Existing token invalid - please reauthenticate',
                })
            }

            switch (res.status) {
                case 401:
                    // try to refresh token
                    const response = await refresh(token.refreshToken)
                    if (typeof response === 'number')
                        return reply.status(response).send({
                            error: 'Token refresh failed — re-auth required.',
                        })
                    else if (response.refresh_token) {
                        // set the refresh token cookie
                        reply.setCookie(
                            'spotify_refresh_token',
                            response.refresh_token,
                            {
                                httpOnly: true, // not accessible via document.cookie
                                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                                sameSite: 'lax', // CSRF protection
                                path: '/',
                                maxAge: 60 * 60 * 24 * 60, // 60 days
                                signed: true, // HMAC-signed with COOKIE_SECRET
                            },
                        )
                    }

                    // we don't need to await this since we're sending the token back anyway
                    server.tokenStore.set(
                        `spotify:${config.TWITCH_BROADCASTER_ID}`,
                        {
                            accessToken: response.access_token,
                            refreshToken:
                                response.refresh_token ?? refreshToken,
                            expiresIn: response.expires_in,
                            obtainedAt: Date.now(),
                            scope: SPOTIFY_SCOPE_STRING,
                            userId: config.TWITCH_BROADCASTER_ID,
                            provider: 'spotify',
                        } as ThirdPartyTokenRecord,
                    )

                    return reply.status(200).send({
                        access_token: response.access_token,
                        expires_in: response.expires_in,
                    })
                case 403:
                // invalid scopes, tell user to reauth
                case 429:
                // check Retry-After header, and wait
                default:
                // return generic error
            }
        }

        return reply.code(200).send({
            access_token: token.accessToken,
            expires_in: token.expiresIn,
        })
    }
}

export function refreshToken(server: FastifyInstance) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const refreshToken = request.unsignCookie(
            request.cookies.spotify_refresh_token ?? '',
        )

        if (!refreshToken.valid || !refreshToken.value) {
            return reply
                .status(401)
                .send({ error: 'Missing or invalid refresh token' })
        }

        if (!config.SPOTIFY_CLIENT_ID || !config.SPOTIFY_CLIENT_SECRET) {
            return reply
                .status(401)
                .send({ error: 'Missing spotify client id or secret' })
        }

        const data = await refresh(refreshToken.value)

        if (typeof data === 'number') {
            return reply.status(data).send({ error: 'test' })
        } else if (data.refresh_token) {
            // sometimes spotify may send back a new refresh token, so we need to update the cookie
            reply.setCookie('spotify_refresh_token', data.refresh_token, {
                httpOnly: true, // not accessible via document.cookie
                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                sameSite: 'lax', // CSRF protection
                path: '/',
                maxAge: 60 * 60 * 24 * 60, // 60 days
                signed: true, // HMAC-signed with COOKIE_SECRET
            })
        }

        server.tokenStore.set(`spotify:${config.TWITCH_BROADCASTER_ID}`, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? refreshToken.value,
            expiresIn: data.expires_in,
            obtainedAt: Date.now(),
            scope: SPOTIFY_SCOPE_STRING,
            userId: config.TWITCH_BROADCASTER_ID,
            provider: 'spotify',
        } as ThirdPartyTokenRecord)

        return { access_token: data.access_token, expires_in: data.expires_in }
    }
}

const refresh = async (refreshToken: string) => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
                'Basic ' +
                Buffer.from(
                    config.SPOTIFY_CLIENT_ID +
                        ':' +
                        config.SPOTIFY_CLIENT_SECRET,
                ).toString('base64'),
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        return 401
    }

    // Spotify sometimes rotates the refresh token — update the cookie if so
    if (data.refresh_token) {
        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
        }
    }

    return {
        access_token: data.access_token,
        expires_in: data.expires_in,
    }
}
