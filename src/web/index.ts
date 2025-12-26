import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const init = (port: number) => {
    console.log(`Initializing web on port ${port}`)

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const reactPath = path.join(__dirname, '..', 'web')
    const server = fastify({ logger: true })

    server.register(fastifyStatic, {
    root: reactPath,
    prefix: '/'
    })

    server.get('/', async (_request, reply) => {
    return reply.sendFile('index.html')
    })

    server.get('/ping', async (_request, _reply) => {
        return 'pong\n'
    })

    return server.listen({ port }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Web server listening at ${address}`)
    })
}

if (import.meta.main) {
    const port = process.env.WEB_PORT ?? '5001'
    init(parseInt(port))
}