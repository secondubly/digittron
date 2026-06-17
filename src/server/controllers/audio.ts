import { AudioAlert } from '@lib/db/models/audio_alert.entity'
import type { FastifyReply, FastifyRequest } from 'fastify'
import path from 'node:path'
import { createWriteStream } from 'fs'
import { promises as fs } from 'fs'
import type { audioId, audioOptions, filename } from '../schemas/audio_alerts'
import { pipeline } from 'node:stream'
import type { User } from '@lib/db/models/user.entity'
import type { TwitchProfile } from 'passport-twitch-new'

const UPLOAD_DIR = path.join(import.meta.dirname, '../', 'uploads', 'audio')

export function uploadFile() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        if (!req.isAuthenticated()) return reply.code(401).send()

        const data = await req.file()

        if (!data) {
            return reply.code(400).send({ error: 'file data is required' })
        }
        const chatterId = data.fields.chatterId as unknown as string
        const chatterName = data.fields.chatterName as unknown as string
        const volume = data.fields.volume as unknown as string

        if (!chatterId) {
            return reply.code(400).send({ error: 'chatterId is required' })
        }

        // check if alert already exists for this chatter
        const existing = await req.em.findOne(AudioAlert, {
            owner: { id: (req.user as TwitchProfile).id },
            chatterId,
        })

        // delete old file if replacing
        if (existing) {
            const oldPath = path.join(process.cwd(), existing.audioUrl)
            await fs.unlink(oldPath).catch(() => {})
            await req.em.remove(existing).flush()
        }

        // save new file
        const ext = path.extname(data.filename)
        const filename = `${crypto.randomUUID()}${ext}`
        const filePath = path.join(UPLOAD_DIR, filename)

        await pipeline(data.file, () => createWriteStream(filePath))

        const alert = req.em.create(AudioAlert, {
            owner: req.user as User,
            chatterId,
            chatterName: chatterName || chatterId,
            audioUrl: `/uploads/audio/${filename}`,
            filename: data.filename,
            volume: volume ? parseFloat(volume) : 0.5,
        })

        await req.em.flush()

        return reply.code(201).send({ alert })
    }
}

export function updateFile() {
    return async (
        req: FastifyRequest<{
            Params: audioId
            Body: audioOptions
        }>,
        reply: FastifyReply,
    ) => {
        {
            if (!req.isAuthenticated()) return reply.code(401).send()
            const { id } = req.params

            const alert = await req.em.findOne(AudioAlert, {
                id: Number(id),
                owner: { id: (req.user as TwitchProfile).id },
            })

            if (!alert) return reply.code(404).send({ error: 'Not found' })

            if (req.body.volume !== undefined) alert.volume = req.body.volume
            if (req.body.enabled !== undefined) alert.enabled = req.body.enabled

            await req.em.flush()
            return { alert }
        }
    }
}

export function deleteFile() {
    return async (
        req: FastifyRequest<{
            Params: audioId
        }>,
        reply: FastifyReply,
    ) => {
        if (!req.isAuthenticated()) return reply.code(401).send()

        const alert = await req.em.findOne(AudioAlert, {
            id: Number(req.params.id),
            owner: { id: (req.user as TwitchProfile).id },
        })

        if (!alert) return reply.code(404).send({ error: 'Not found' })

        // delete file from disk
        const filePath = path.join(process.cwd(), alert.audioUrl)
        await fs.unlink(filePath).catch(() => {})

        await req.em.remove(alert).flush()
        return reply.code(204).send()
    }
}

export function getFile() {
    return async (
        req: FastifyRequest<{
            Params: filename
        }>,
        reply: FastifyReply,
    ) => {
        const { filename } = req.params
        const filePath = path.join(UPLOAD_DIR, filename)
        return reply.sendFile(filePath)
    }
}
