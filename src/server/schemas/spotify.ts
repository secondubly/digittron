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

export const TokenSchema = Type.Object({
    access_token: Type.String(),
    token_type: Type.Literal('Bearer'),
    expires_in: Type.Number(),
    refresh_token: Type.Optional(Type.String()),
    scope: Type.String(),
})

export const callbackQuerySchema = Type.Object({
    state: Type.Optional(Type.String()),
    code: Type.String(),
    error: Type.Optional(Type.String()),
})

export const trackSchema = Type.Object({
    uri: Type.String(),
    name: Type.String(),
    album: Type.Object({
        name: Type.String(),
        images: Type.Array(
            Type.Object({
                url: Type.String(),
                height: Type.Number(),
                width: Type.Number(),
            }),
        ),
    }),
    artists: Type.Array(
        Type.Object({
            name: Type.String(),
        }),
    ),
})

export const currentlyPlayingSchema = Type.Object({
    is_playing: Type.Boolean(),
    item: trackSchema,
})

export type getTokenParams = Static<typeof getTokenParamsSchema>
export type UpdateTokenParams = Static<typeof updateTokenParamsSchema>
export type UpdateTokenInput = Static<typeof updateTokenBodySchema>
export type callbackQuerySchema = Static<typeof callbackQuerySchema>
export type trackSchema = Static<typeof trackSchema>
export type currentlyPlaying = Static<typeof currentlyPlayingSchema>
