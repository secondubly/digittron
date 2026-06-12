import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { log } from '@lib/services/logger.js'
import { type getTokenParams } from '../schemas/spotify.js'
// import { config } from 'src/config.js'

export function getToken(server: FastifyInstance) {
    return async (
        request: FastifyRequest<{
            Params: getTokenParams
        }>,
        reply: FastifyReply,
    ) => {
        const { id } = request.params

        const token = await server.tokenStore.get(`spotify:${id}`)

        if (!token) {
            log.bot.warn(`No token for spotify:${id} — re-auth required`)
            return null
        }

        return reply.code(200).send(token)
    }
}
