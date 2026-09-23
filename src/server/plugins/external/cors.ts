import cors, { type FastifyCorsOptions } from '@fastify/cors'
import type { FastifyInstance } from 'fastify'

export const autoConfig: FastifyCorsOptions = {
  origin: function (this: FastifyInstance, origin, cb) {
    this.log.info({ origin }, '[CORS] routing request')
    // Allow requests with no origin (e.g. Postman, mobile apps, curl)
    if (!origin) {
      this.log.info('[CORS] No origin found')
      cb(null, true)
      return
    }

    const hostname = new URL(origin).hostname
    const isLocal = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1') || hostname.startsWith('192.168.')

    this.log.info(`[CORS] HOSTNAME: ${hostname}`)
    if (isLocal) {
      cb(null, true)
      return
    } else {
      cb(new Error('[CORS] Not allowed'), false)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

export default cors
