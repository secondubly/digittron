import type { FastifyPluginAsync } from 'fastify'
import { getTwitchToken } from '../../../controllers/twitch.js'
import {
    twitchParamsSchema,
    twitchTokenQuerySchema,
    twitchTokenResponseSchema,
    CallbackSchema,
} from 'src/server/schemas/twitch.js'
import { handleCallback } from 'src/server/controllers/twitch.js'

const plugin: FastifyPluginAsync = async (fastify) => {
    // GET /token - get Twitch token
    fastify.get(
        '/token/:id',
        {
            schema: {
                params: twitchParamsSchema,
                querystring: twitchTokenQuerySchema,
                response: {
                    200: twitchTokenResponseSchema,
                },
            },
        },
        getTwitchToken,
    )

    // GET /callback
    fastify.get(
        '/callback',
        {
            schema: CallbackSchema,
        },
        handleCallback(fastify),
    )
}

export default plugin
