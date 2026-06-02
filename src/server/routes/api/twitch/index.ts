import type { FastifyPluginAsync } from 'fastify'
import { getTwitchToken } from '../../../controllers/twitch.js'
import {
    twitchParamsSchema,
    twitchTokenQuerySchema,
    twitchTokenResponseSchema,
} from 'src/server/schemas/twitch.js'

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
}

export default plugin
