import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateUserInput, LoginUserInput } from '../schemas/user'
import bcrypt from 'bcrypt'
import { RequestContext } from '@mikro-orm/core'
import { User } from '@lib/db/models/user.entity'

const SALT_ROUNDS = 10
export async function createUser(
    req: FastifyRequest<{
        Body: CreateUserInput
    }>,
    reply: FastifyReply,
) {
    const { password, username } = req.body
    const em = RequestContext.getEntityManager()
    if (!em) {
        throw new Error('Could not retrieve entity manager')
    }
    const userTable = await em.getRepository(User)
    let user = await userTable.findOne({
        username,
    })
    if (user) {
        return reply.code(401).send({
            message: 'User already exists with this username',
        })
    }
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS)
        user = em.create(User, {
            username,
            password: hash,
        })

        await em.flush()
        return reply.code(201).send(user)
    } catch (e) {
        return reply.code(500).send(e)
    }
}

export async function login(
    req: FastifyRequest<{ Body: LoginUserInput }>,
    reply: FastifyReply,
) {
    const em = RequestContext.getEntityManager()
    if (!em) {
        throw new Error('Could not retrieve entity manager')
    }
    const { username, password } = req.body
    const userTable = await em.getRepository(User)
    const user = await userTable.findOne({
        username,
    })

    const isMatch = user && (await bcrypt.compare(password, user.password))
    if (!user || !isMatch) {
        return reply.code(401).send({
            message: 'Invalid username or password',
        })
    }

    const payload = {
        id: user.id,
        username: user.username,
    }

    const token = req.jwt.sign(payload)
    reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: false, // TODO: set this to true when deploying to production
        sameSite: 'none', // REVIEW: this should only be set in development
    })

    return { accessToken: token }
}

export async function logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('access_token')
    return reply.send({ message: 'Logout successful' })
}
