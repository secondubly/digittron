import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static'
import path from 'node:path'
import fp from 'fastify-plugin'
import type { FastifyRegisterOptions } from 'fastify'

const dirPath = path.join(import.meta.dirname, '../../', 'public', 'assets')
const staticOpts: FastifyRegisterOptions<FastifyStaticOptions> = {
  root: dirPath,
  prefix: '/public/',
  decorateReply: false,
}

export default fp(async (fastify) => {
  fastify.register(fastifyStatic, staticOpts)
})
