import { buildJsonSchemas } from 'fastify-zod'
import { z } from 'zod'

const getTokenParamsSchema = z.object({
    id: z.string({
        required_error: 'ID is required',
    }),
})

const updateTokenParamsSchema = z.object({
    id: z.string({
        required_error: 'ID is required',
    }),
})

const updateTokenBodySchema = z.object({
    access_token: z.string(),
    token_type: z.literal('Bearer'),
    expires_in: z.number(),
    refresh_token: z.string().optional(),
    scope: z.array(z.string()),
})

const getTokenResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.literal('Bearer'),
    expires_in: z.number(),
    refresh_token: z.string().optional(),
    scope: z.array(z.string()),
})

export type getTokenParams = z.infer<typeof getTokenParamsSchema>
export type UpdateTokenParams = z.infer<typeof updateTokenParamsSchema>
export type UpdateTokenInput = z.infer<typeof updateTokenBodySchema>

export const { schemas: spotifySchemas, $ref } = buildJsonSchemas(
    {
        getTokenParamsSchema,
        updateTokenParamsSchema,
        updateTokenBodySchema,
        getTokenResponseSchema,
    },
    {
        $id: 'SpotifySchemas',
    },
)
