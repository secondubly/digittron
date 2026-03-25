import { type Static, Type } from 'typebox'

export const getTokenParamsSchema = Type.Object({
    id: Type.String(),
})

export const updateTokenParamsSchema = Type.Object({
    id: Type.String(),
})

export const updateTokenBodySchema = Type.Object({
    access_token: Type.String(),
    token_type: Type.Literal('Bearer'),
    expires_in: Type.Number(),
    refresh_token: Type.String(),
    scope: Type.Array(Type.String()),
})

export const getTokenResponseSchema = Type.Object({
    access_token: Type.String(),
    token_type: Type.Literal('Bearer'),
    expires_in: Type.Number(),
    refresh_token: Type.Optional(Type.String()),
    scope: Type.Array(Type.String()),
})

export type getTokenParams = Static<typeof getTokenParamsSchema>
export type UpdateTokenParams = Static<typeof updateTokenParamsSchema>
export type UpdateTokenInput = Static<typeof updateTokenBodySchema>
