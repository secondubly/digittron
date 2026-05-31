import type { FastifyPluginAsync } from 'fastify'
import {
    getSpotifyToken,
    handleSpotifyCallback,
    putSpotifyToken,
} from '../../../controllers/spotify.js'
import {
    callbackQuerySchema,
    getTokenParamsSchema,
    getTokenResponseSchema,
    updateTokenBodySchema,
    updateTokenParamsSchema,
} from 'src/server/schemas/spotify.js'

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        '/token',
        {
            schema: {
                params: getTokenParamsSchema,
                response: {
                    200: getTokenResponseSchema,
                },
            },
        },
        getSpotifyToken,
    )

    fastify.get(
        '/callback',
        {
            schema: {
                querystring: callbackQuerySchema,
            },
        },
        handleSpotifyCallback,
    )

    fastify.put(
        '/token',
        {
            schema: {
                params: updateTokenParamsSchema,
                body: updateTokenBodySchema,
            },
        },
        putSpotifyToken,
    )
}

export default plugin
