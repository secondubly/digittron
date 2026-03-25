import fCookie, { type FastifyCookieOptions } from '@fastify/cookie'

export const autoConfig = (): FastifyCookieOptions => {
    return {
        secret: 'some-secret-key',
        hook: 'preHandler',
    }
}

export default fCookie
