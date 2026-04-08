import fCookie, { type FastifyCookieOptions } from '@fastify/cookie'

export const autoConfig = (): FastifyCookieOptions => {
    return {
        secret: process.env.COOKIE_SECRET ?? 'some-secret-key',
        hook: 'preHandler',
    }
}

export default fCookie
