import fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify'
import { log } from '../core/utils/logger'

export const init = (port: number) => {
  console.log(`Initializing web on port ${port}`)

  let server: FastifyInstance
  if (process.env.NODE_ENV === 'development') {
    server = fastify({
      loggerInstance: log.web as FastifyBaseLogger,
    })
  } else {
    server = fastify()
  }

  server.get('/', async (_request, reply) => {
    return reply.sendFile('index.html')
  })

  server.get('/ping', async (_request, _reply) => {
    return 'pong\n'
  })

  if (process.env.NODE_ENV === 'development') {
    return server.listen({ port }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Web server listening at ${address}`)
    })
  } else {
    // if running via docker, listen on all interfaces to enable connection from outside the container
    return server.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Web server listening at ${address}`)
    })
  }
}

if (import.meta.main) {
  const port = process.env.WEB_PORT ?? '5001'
  init(parseInt(port))
}
