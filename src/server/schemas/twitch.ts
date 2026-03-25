import { type Static, Type } from 'typebox'

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

export type TwitchTokenInputParams = Static<typeof twitchParamsSchema>
export type TwitchTokenQuery = Static<typeof twitchTokenQuerySchema>
