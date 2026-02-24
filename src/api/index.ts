import fastify, {
    type FastifyBaseLogger,
    type FastifyInstance,
    type FastifyReply,
    type FastifyRequest,
} from 'fastify'
import cors from '@fastify/cors'
import FastifyStatic from '@fastify/static'
import { MikroORM } from '@mikro-orm/sqlite'
import fastifySSE from '@fastify/sse'
import { Token } from '../lib/db/models/token.entity.js'
import type { AccessToken } from '@twurple/auth'
import { log } from '@lib/utils/logger.js'
import { setupShutdownHandler } from '@lib/utils/utils.js'
import type { SpotifyAccessToken } from '@lib/core/types.js'
import redisClient from '@lib/utils/redis.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

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

interface SpotifyPostBody {
    id: string
    access_token: string
}

setupShutdownHandler()
let clients: Client[] = []
const twitchAudioMap: Map<string, string> = new Map([
    ['537326154', '537326154.wav'],
])

// setup database connection
const orm = await MikroORM.init()
const em = orm.em.fork()

const sendAudioUpdates = (data: string) => {
    clients.forEach((client) => {
        client.response.sse.send({
            event: 'play',
            data,
        })
    })
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const web = path.join(__dirname, '..', '..', 'build', 'web')

export const routes = {
    async getTwitchToken(id: string, scopes: string) {
        const scopesArray = scopes ? scopes.split(',') : undefined
        const tokensTable = em.getRepository(Token)

        const token = await tokensTable.findOne(parseInt(id), {
            fields: ['twitchAccessToken'],
        })

        if (!token || !token.twitchAccessToken) {
            return null
        }

        let accessToken: AccessToken
        if (scopesArray) {
            accessToken = JSON.parse(token.twitchAccessToken) as AccessToken
            accessToken.scope = scopesArray
        } else {
            accessToken = JSON.parse(token.twitchAccessToken) as AccessToken
        }

        return accessToken
    },
    getAudio(id: string) {
        return twitchAudioMap.get(id)
    },
    async getSpotifyToken(id: string): Promise<SpotifyAccessToken | null> {
        const tokensTable = em.getRepository(Token)

        const token = await tokensTable.findOne(
            { id: parseInt(id) },
            {
                fields: ['spotifyAccessToken'],
            },
        )

        if (!token || !token.spotifyAccessToken) {
            return null
        }

        const spotifyAccessToken: SpotifyAccessToken = JSON.parse(
            token.spotifyAccessToken,
        )

        log.api.debug(
            `spotify access token: ${JSON.stringify(spotifyAccessToken, null, '\t')}`,
        )
        return spotifyAccessToken
    },

    async setSpotifyToken(id: string, token: SpotifyAccessToken) {
        const tokensTable = em.getRepository(Token)

        const oldToken = await tokensTable.findOne(parseInt(id))
        if (oldToken) {
            oldToken.spotifyAccessToken = JSON.stringify(token)
            await em.flush()
        }
        return
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
        origin: (origin, cb) => {
            if (!origin || /localhost:5000/.test(origin) || /localhost:5001/.test(origin) || /192.168.1.\d+/.test(origin)) {
                cb(null, true)
                return
            }

            cb(new Error('Not allowed'), false)
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })

    await server.register(FastifyStatic, {
        root: web
    })

    await server.register(fastifySSE)

    // GET /ping - test endpoint
    server.get('/ping', async (_request, _reply) => {
        return 'pong\n'
    })

    server.get('/', async (_request, reply) => {
        return reply.sendFile('index.html')
    })

    // GET /api/token/{id} - for retrieving twitch api tokens
    server.get<{
        Params: RequestParams
        Querystring: TokenQueryString
    }>('/api/token/:id', async (request, reply) => {
        const { id } = request.params
        const { scopes } = request.query

        const token = await routes.getTwitchToken(id, scopes)

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

            reply.code(200).send(accessToken)
        }

        return
    })

    // GET /api/audio/:id - for getting audio files for twitch users
    server.get(
        '/api/audio/:id',
        async (request: FastifyRequest<{ Params: RequestParams }>, reply) => {
            const { id: twitchId } = request.params
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

    // GET /api/spotify-token/{id} - get spotify token for provided user id
    server.get<{
        Params: RequestParams
    }>('/api/spotify-token/:id', async (request, reply) => {
        const { id } = request.params
        const token = await routes.getSpotifyToken(id)

        if (!token) {
            reply.code(404).send({ error: 'Token not found' })
            return
        } else if (!token.refresh_token) {
            reply
                .code(422)
                .send({ error: 'No refresh token attached to access token' })
            return
        }

        if (!redisClient.isOpen) {
            await redisClient.connect()
        }

        await redisClient.set(`spotify_${id}`, JSON.stringify(token))
        reply.code(200).send(token)
    })

    // POST /api/spotify-token - update spotify token for provided user
    server.post<{
        Body: SpotifyPostBody
    }>('/api/spotify-token', async (request, reply) => {
        const { id, access_token } = request.body

        const tokensTable = em.getRepository(Token)
        const oldToken = await tokensTable.findOne(
            { id: parseInt(id) },
            {
                fields: ['spotifyAccessToken'],
            },
        )

        if (!oldToken) {
            reply.code(404).send({
                message: 'Could not find token matching given ID',
            })
            return
        }

        oldToken.spotifyAccessToken = access_token
        em.flush()

        reply.code(200).send({ message: 'spotify token updated successfully' })
    })

    // GET /events - SSR listener for audio events
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
        log.api.info('API server running in development mode')
        return server.listen({ port }, (err, address) => {
            if (err) {
                log.api.error(err)
                process.exit(1)
            }
            log.api.info(`API server listening at ${address}`)
        })
    } else {
        // if running via docker - we need to listen on all hosts to enable the front end to connect
        return server.listen({ port, host: '0.0.0.0' }, (err, address) => {
            if (err) {
                log.api.error(err)
                process.exit(1)
            }
            log.api.info(`API server listening at ${address}`)
        })
    }
}

if (import.meta.main) {
    const port = process.env.API_PORT ?? '4001'
    init(parseInt(port))
}
