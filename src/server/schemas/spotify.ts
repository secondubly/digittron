import { type Static, Type } from '@sinclair/typebox'

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

export type trackSchema = Static<typeof trackSchema>
export type currentlyPlaying = Static<typeof currentlyPlayingSchema>
