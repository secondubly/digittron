import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static'
import path from 'node:path'
import fp from 'fastify-plugin'
import type { FastifyRegisterOptions } from 'fastify'

const dirPath = path.join(import.meta.dirname, '../../', 'uploads', 'audio')
const staticOpts: FastifyRegisterOptions<FastifyStaticOptions> = {
    root: dirPath,
    prefix: '/uploads/audio',
    decorateReply: false,
}

export default fp(async (fastify) => {
    fastify.register(fastifyStatic, staticOpts)
})
