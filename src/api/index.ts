import fastify from 'fastify'
import config from '../mikro-orm.config.js'
import { MikroORM } from '@mikro-orm/sqlite'
import { Token } from '../lib/db/models/token.entity.js'
import { AccessToken } from '@twurple/auth'

interface IQuerystring {
    id: string
    scopes: string
}

interface IHeaders {
    'h-Custom': string
}

interface IReply {
    200: { token: AccessToken }
    302: { url: string }
    '4xx': { error: string }
}

const server = fastify()

const orm = await MikroORM.init(config)
const em = orm.em.fork()

server.get<{
    Querystring: IQuerystring
    Headers: IHeaders
    Reply: IReply
}>('/api/token', async (request, reply) => {
    const { id, scopes } = request.query

    const scopesArray = scopes ? scopes.split(',') : undefined
    const tokensTable = em.getRepository(Token)
    const token = await tokensTable.findOne({
        id: parseInt(id),
    })

    if (!token) {
        reply.code(404).send({ error: 'Token not found' })
    } else {
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

        reply.code(200).send({ token: accessToken })
    }

    return
})

server.get('/ping', async (_request, _reply) => {
    return 'pong\n'
})

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
