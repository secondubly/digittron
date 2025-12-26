import fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import config from '../mikro-orm.config.js'
import { MikroORM } from '@mikro-orm/sqlite'
import { Token } from '../lib/db/models/token.entity.js'
import { type AccessToken } from '@twurple/auth'
import fastifySSE from '@fastify/sse'
import logger from '@lib/utils/logger.js'

interface IQuerystringToken {
    id: string
    scopes: string
}

interface Client {
    id: number
    response: FastifyReply
}

type AudioRequest = FastifyRequest<{
    Params: { twitchId: string }
}>

// setup database connection
const orm = await MikroORM.init(config)
const em = orm.em.fork()
let clients: Client[] = []
const twitchAudioMap: Map<string, string> = new Map([
    ['537326154', '537326154.wav'],
])

const sendAudioUpdates = (data: string) => {
    clients.forEach((client) => {
        client.response.sse.send({
            event: 'play',
            data,
        })
    })
}

// GET: /api/token
export const getToken = async (id: string, scopes: string) => {
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
}

// GET: /api/audio/:id
export const getAudio = (id: string) => {
    logger.info(`Server received playback request for twitch id: ${id}`)
    return twitchAudioMap.has
    if (!twitchAudioMap.has(id)) {
        return false
    } else {
        sendAudioUpdates(id)
        return true
    }
}

// create standalone serve if this file in the entrypoint
if (import.meta.main) {
    const port = process.env.API_PORT ?? 6000
    logger.info(`API server initializing on port ${port}`)

    const server = fastify()

    // register plugins
    await server.register(fastifySSE.default)

    // setup database connection
    server.get<{
        Querystring: IQuerystringToken
    }>('/api/token', async (request, reply) => {
        const { id, scopes } = request.query

        const token = await getToken(id, scopes)

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

    // TODO: should this be a GET or POST request?
    server.get('/api/audio/:twitchId', async (request: AudioRequest, reply) => {
        const { twitchId } = request.params
        // TODO: grab filename
        logger.info(
            `Server received playback request for twitch id: ${twitchId}`,
        )
        if (getAudio(twitchId)) {
        }
        if (!twitchAudioMap.has(twitchId)) {
            reply
                .code(404)
                .send({ error: `Audio file not found for id: ${twitchId}` })
        } else {
            sendAudioUpdates(twitchId)
            reply.code(200).send()
        }
    })

    server.get('/events', { sse: true }, async (request, reply) => {
        reply.sse.keepAlive()
        await reply.sse.send({ data: 'Connected' })

        const clientId = Date.now()
        const newClient: Client = {
            id: clientId,
            response: reply,
        }
        clients.push(newClient)

        reply.sse.onClose(() => {
            logger.info(`SSE Client closed: ${clientId}`)
            clients = clients.filter((client) => clientId !== client.id)
        })
    })

    server.get('/ping', async (_request, _reply) => {
        return 'pong\n'
    })

    server.listen({ port }, (err, address) => {
        if (err) {
            logger.error(err)
            process.exit(1)
        }
        logger.info(`Server running at ${address}`)
    })
}

export const init = async (port: number = 5000) => {
    const sendAudioUpdates = (data: string) => {
        clients.forEach((client) => {
            client.response.sse.send({
                event: 'play',
                data,
            })
        })
    }

    // TODO: should this be a GET or POST request?
    server.get('/api/audio/:twitchId', async (request: AudioRequest, reply) => {
        const { twitchId } = request.params
        // TODO: grab filename
    })

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
            logger.info(`SSE Client closed: ${clientId}`)
            clients = clients.filter((client) => clientId !== client.id)
        })
    })

    server.get('/ping', async (_request, _reply) => {
        return 'pong\n'
    })

    server.get('/', async (_request, reply) => {
        console.log('hello index page')
        reply.sendFile('index.html')
    })

    await server.listen({ port }, (err, address) => {
        if (err) {
            logger.error(err)
            process.exit(1)
        }
        logger.info(`Server running at ${address}`)
    })
}
