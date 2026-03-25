import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static'
import path from 'node:path'

export const autoConfig = (): FastifyStaticOptions => {
    const dirPath = path.join(
        import.meta.dirname,
        '../../../../',
        'build',
        'web',
    )

    return {
        root: dirPath,
        prefix: `/`,
    }
}

export default fastifyStatic
