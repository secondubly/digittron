import fastify, {
    type FastifyBaseLogger,
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from 'fastify'
import cors from '@fastify/cors'
import config from '../mikro-orm.config.js'
import { MikroORM } from '@mikro-orm/sqlite'
import fastifySSE from '@fastify/sse'
import { Token } from '../lib/db/models/token.entity.js'
import type { AccessToken } from '@twurple/auth'
import { log } from '@lib/utils/logger.js'
import { setupShutdownHandler } from '@lib/utils/utils.js'

interface Client {
    id: number
    response: FastifyReply
}

interface TokenQueryString {
    scopes: string
}

type RequestParams = {
    id: string
}

setupShutdownHandler()
let clients: Client[] = []
const twitchAudioMap: Map<string, string> = new Map([
    ['537326154', '537326154.wav'],
])

// setup database connection
const orm = await MikroORM.init(config)
const em = orm.em.fork()

const sendAudioUpdates = (data: string) => {
    clients.forEach((client) => {
        client.response.sse.send({
            event: 'play',
            data,
        })
    })
}

export const routes = {
    async getToken(id: string, scopes: string) {
        const scopesArray = scopes ? scopes.split(',') : undefined
        const tokensTable = em.getRepository(Token)

        const token = await tokensTable.findOne({
            id: parseInt(id),
        })

        if (!token) {
            return null
        }

        let accessToken = undefined
        if (scopesArray) {
            accessToken = {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                scope: scopesArray,
                expiresIn: 0,
                obtainmentTimestamp: 0,
            } as AccessToken
        } else {
            accessToken = {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: 0,
                obtainmentTimestamp: 0,
            } as AccessToken
        }

        return accessToken
    },
    getAudio(id: string) {
        return twitchAudioMap.get(id)
    },
}

export const init = async (port: number) => {
    log.api.info(`Initializing API on port ${port}`)

    let server: FastifyInstance
    if (process.env.NODE_ENV === 'development') {
        server = fastify({
            loggerInstance: log.api as FastifyBaseLogger,
        })
    } else {
        server = fastify()
    }

    await server.register(cors, {
        origin: ['http://localhost:5000', 'http://localhost:5001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })

    await server.register(fastifySSE)

    // GET /ping - test endpoint
    server.get('/ping', async (_request, _reply) => {
        return 'pong\n'
    })

    server.get<{
        Params: RequestParams
        Querystring: TokenQueryString
    }>('/api/token/:id', async (request, reply) => {
        const { id } = request.params
        const { scopes } = request.query

        const token = await routes.getToken(id, scopes)

        if (!token) {
            reply.code(404).send({ error: 'Token not found' })
        } else {
            let accessToken
            if (scopes) {
                accessToken = {
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    scope: scopes.split(','),
                    expiresIn: 0,
                    obtainmentTimestamp: 0,
                } as AccessToken
            } else {
                accessToken = {
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    expiresIn: 0,
                    obtainmentTimestamp: 0,
                } as AccessToken
            }

            reply.code(200).send({ token: accessToken })
        }

        return
    })

    // GET /api/audio/:id
    server.get(
        '/api/audio/:id',
        async (request: FastifyRequest<{ Params: RequestParams }>, reply) => {
            const { id: twitchId } = request.params
            console.log(request.params)
            console.log(request.params.id)
            // TODO: grab filename
            log.api.info(
                `Server received playback request for twitch id: ${twitchId}`,
            )

            if (!twitchId) {
                reply.code(400).send({ error: 'Invalid request.' })
            }

            const audioFilename = routes.getAudio(twitchId)
            if (!audioFilename) {
                reply
                    .code(404)
                    .send({ error: `Audio file not found for id: ${twitchId}` })
            } else {
                sendAudioUpdates(twitchId)
                reply.code(200).send()
            }
        },
    )

    server.get('/events', { sse: true }, async (_request, reply) => {
        reply.sse.keepAlive()
        await reply.sse.send({ data: 'Connected' })

        const clientId = Date.now()
        const newClient: Client = {
            id: clientId,
            response: reply,
        }
        clients.push(newClient)

        reply.sse.onClose(() => {
            log.api.info(`SSE Client closed: ${clientId}`)
            clients = clients.filter((client) => clientId !== client.id)
        })
    })

    if (process.env.NODE_ENV === 'development') {
        return server.listen({ port }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            log.api.info(`API server listening at ${address}`)
        })
    } else {
        // if running via docker - we need to listen on all hosts to enable the front end to connect
        return server.listen({ port, host: '0.0.0.0' }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`API server listening at ${address}`)
        })
    }
}

if (import.meta.main) {
    const port = process.env.API_PORT ?? '4001'
    init(parseInt(port))
}
