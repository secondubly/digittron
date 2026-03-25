import Fastify from 'fastify'
import bootstrap from '../src/server/build.js'
import fp from 'fastify-plugin'
import { TestContext } from 'node:test'

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
        t.after(() => server.close())
    }

    return server
}
