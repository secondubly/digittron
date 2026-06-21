import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static'
import path from 'node:path'
import fp from 'fastify-plugin'
import type { FastifyRegisterOptions } from 'fastify'

const dirPath = path.join(import.meta.dirname, '../../../../', 'build', 'web')
const staticOpts: FastifyRegisterOptions<FastifyStaticOptions> = {
  root: dirPath,
  prefix: '/',
}

export default fp(async (fastify) => {
  fastify.register(fastifyStatic, staticOpts)
})
