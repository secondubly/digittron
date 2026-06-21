import Fastify, { preHandlerAsyncHookHandler } from 'fastify'
import type { MikroORM } from '@mikro-orm/core'
import bootstrap from '../../src/server/build.js'
import fp from 'fastify-plugin'
import { TestContext } from 'node:test'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: preHandlerAsyncHookHandler
    orm: MikroORM
  }
}

export function config() {
  return {
    skipOverride: true,
  }
}

export async function build(t?: TestContext) {
  const server = Fastify()
  server.register(fp(bootstrap), config())

  await server.ready()

  if (t) {
    t.after(() => {
      server.orm.close()
      server.close()
    })
  }

  return server
}
