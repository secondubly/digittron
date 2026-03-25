import fjwt, { type FastifyJWTOptions } from '@fastify/jwt'

export const autoConfig = (): FastifyJWTOptions => {
    return {
        secret:
            process.env.JWT_TOKEN ??
            'This_Should_Be_A_Unique_Randomly_Geneated_String',
    }
}

export default fjwt
