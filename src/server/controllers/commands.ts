import { Channel, CustomCommand, UserLevel } from '@core/db/models/CustomCommands.entity'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { commandBody } from '../schemas/commands'

export async function createCustomCommand(
  req: FastifyRequest<{
    Body: commandBody
  }>,
  reply: FastifyReply,
) {
  const {
    command_name: commandName,
    response: commandResponse,
    channel_id: channelId,
    channel_name: channelName,
  } = req.body

  let { user_level: userLevel } = req.body

  const existingCommand = await req.em.findOne(CustomCommand, {
    name: commandName,
  })

  if (existingCommand) return reply.code(422).send('Existing command with same name found.')

  let existingChannel = await req.em.findOne(Channel, {
    twitchId: channelId,
  })

  if (!existingChannel) {
    existingChannel = req.em.create(Channel, {
      twitchId: channelId,
      name: channelName,
    })

    await req.em.flush()
  }

  if (userLevel && !isValidEnum(userLevel)) {
    // if user level is provided and is not valid, return an error
    reply.code(400).send('Invalid user level provided.')
  } else if (!userLevel) {
    // otherwise if no userLevel provided
    userLevel = UserLevel.EVERYONE
  }

  req.em.clear()

  const command = req.em.create(CustomCommand, {
    channel: existingChannel.id,
    name: commandName,
    response: commandResponse,
    userLevel: (userLevel as UserLevel) ?? UserLevel.EVERYONE,
    cooldownSeconds: 0,
    userCooldownSeconds: 0,
    usageCount: 0,
    enabled: false,
    createdBy: '',
  })

  await req.em.flush()

  return reply.code(200).send(command)
}

// export async function updateCustomCommand(req: FastifyRequest, reply: FastifyReply) {}

// export async function deleteCustomCommand(req: FastifyRequest, reply: FastifyReply) {}

function isValidEnum(value: string): value is UserLevel {
  return Object.values(UserLevel).includes(value as UserLevel)
}
