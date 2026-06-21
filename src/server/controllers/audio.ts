import { AudioAlert } from '@core/db/models/audio_alert.entity'
import type { FastifyReply, FastifyRequest } from 'fastify'
import path from 'node:path'
import { createWriteStream } from 'fs'
import { promises as fs } from 'fs'
import type { audioId, audioOptions, filename } from '../schemas/audio_alerts'
import { pipeline } from 'node:stream'
import type { MultipartValue } from '@fastify/multipart'
import { promisify } from 'node:util'
import { User } from '@core/db/models/user.entity'

const UPLOAD_DIR = path.join(import.meta.dirname, '../', 'uploads', 'audio')

export async function uploadFile(req: FastifyRequest, reply: FastifyReply) {
  if (!req.isAuthenticated()) return reply.code(401).send()

  const data = await req.file()

  if (!data) {
    return reply.code(400).send({ error: 'file data is required' })
  }

  const chatterId = (data.fields.chatterId as MultipartValue<string>).value
  const chatterName = (data.fields.chatterName as MultipartValue<string>).value

  let volume: string
  if (!data.fields.volume) {
    volume = '0.5'
  } else {
    volume = (data.fields.volume as MultipartValue<string>).value
  }

  if (!chatterId) {
    return reply.code(400).send({ error: 'chatterId is required' })
  }

  // check if alert already exists for this chatter
  const existing = await req.em.findOne(AudioAlert, {
    owner: { twitch_id: req.user!.twitch_id },
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

  /**
   * Manually promisify pipeline because newer versions of pipeline expect a function as the final param,
   */
  await promisify(pipeline)(data.file, createWriteStream(filePath))

  const owner = await req.em.findOneOrFail(User, {
    twitch_id: req.user!.twitch_id,
  })

  const alert = req.em.create(AudioAlert, {
    owner,
    chatterId,
    chatterName: chatterName || chatterId,
    audioUrl: `/uploads/audio/${filename}`,
    filename: data.filename,
    volume: volume ? parseFloat(volume) : 0.5,
    enabled: true,
  })

  await req.em.flush()

  return reply.code(201).send({ alert })
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
        owner: { twitch_id: req.user!.twitch_id },
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
      owner: { twitch_id: req.user!.twitch_id },
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
