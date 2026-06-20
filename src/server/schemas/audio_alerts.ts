import { type Static, Type } from '@sinclair/typebox'

export const audioIdSchema = Type.Object({
    id: Type.String(),
})

export const audioOptionsSchema = Type.Object({
    volume: Type.Number(),
    enabled: Type.Boolean(),
})

export const filenameSchema = Type.Object({
    filename: Type.String(),
})

export type audioId = Static<typeof audioIdSchema>
export type audioOptions = Static<typeof audioOptionsSchema>
export type filename = Static<typeof filenameSchema>
