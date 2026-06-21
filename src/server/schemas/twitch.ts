import { type Static, Type } from '@sinclair/typebox'

export const twitchParamsSchema = Type.Object({
  id: Type.String(),
})

export const twitchTokenQuerySchema = Type.Object({
  scopes: Type.Optional(Type.String()),
})

export const twitchTokenResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.Optional(Type.String()),
  scope: Type.Array(Type.String()),
  expiresIn: Type.Optional(Type.Number()),
  obtainmentTimestamp: Type.Optional(Type.Number()),
})

export const CallbackSchema = Type.Object({
  state: Type.Optional(Type.String()),
  code: Type.String(),
  error: Type.Optional(Type.String()),
})

export type TwitchTokenInputParams = Static<typeof twitchParamsSchema>
export type TwitchTokenQuery = Static<typeof twitchTokenQuerySchema>
export type CallbackSchemaType = Static<typeof CallbackSchema>
