import fp from 'fastify-plugin'
import fjwt, { type FastifyJWTOptions } from '@fastify/jwt'

const opts: FastifyJWTOptions = {
    secret:
        process.env.JWT_TOKEN ??
        'This_Should_Be_A_Unique_Randomly_Geneated_String',
}

export default fp(async (fastify) => {
    fastify.register(fjwt, opts)
    fastify.addHook('preHandler', (request, _response, next) => {
        request.jwt = fastify.jwt
        return next()
    })
})
