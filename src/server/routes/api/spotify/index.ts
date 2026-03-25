import type { FastifyPluginAsync } from 'fastify'
import { $ref } from '../../../schemas/spotify.js'
import {
    getSpotifyToken,
    putSpotifyToken,
} from '../../../controllers/spotify.js'

const plugin: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        '/token',
        {
            schema: {
                params: $ref('getTokenParamsSchema'),
                response: {
                    200: $ref('getTokenResponseSchema'),
                },
            },
        },
        getSpotifyToken,
    )

    fastify.put(
        '/token',
        {
            schema: {
                params: $ref('updateTokenParamsSchema'),
                body: $ref('updateTokenBodySchema'),
            },
        },
        putSpotifyToken,
    )
}

export default plugin
