import { type Static, Type } from '@sinclair/typebox'

export const commandBodySchema = Type.Object({
  command_name: Type.String(),
  response: Type.String(),
  user_level: Type.Optional(Type.String()),
  alias: Type.Optional(Type.String()),
  created_by: Type.String(),
  channel_id: Type.String(),
  channel_name: Type.String(),
  cooldown: Type.Optional(Type.Number()),
})

export type commandBody = Static<typeof commandBodySchema>
