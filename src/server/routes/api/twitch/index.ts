import type { FastifyPluginAsync } from 'fastify'
import { $ref } from '../../../schemas/twitch.js'
import { getTwitchToken } from '../../../controllers/twitch.js'

const plugin: FastifyPluginAsync = async (fastify) => {
    // GET /token - get Twitch token
    fastify.get(
        '/token',
        {
            schema: {
                params: $ref('twitchParamsSchema'),
                querystring: $ref('twitchTokenQuerySchema'),
                response: {
                    200: $ref('twitchTokenResponseSchema'),
                },
            },
        },
        getTwitchToken,
    )
}

export default plugin
