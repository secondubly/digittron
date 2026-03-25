import { buildJsonSchemas } from 'fastify-zod'
import { z } from 'zod'

const twitchParamsSchema = z.object({
    id: z.string({
        required_error: 'ID is required',
    }),
})

const twitchTokenQuerySchema = z.object({
    scopes: z.string().optional(),
})

const twitchTokenResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    scope: z.array(z.string()),
    expiresIn: z.number().optional(),
    obtainmentTimestamp: z.number(),
})

export type TwitchTokenInputParams = z.infer<typeof twitchParamsSchema>
export type TwitchTokenQuery = z.infer<typeof twitchTokenQuerySchema>

export const { schemas: twitchTokenSchemas, $ref } = buildJsonSchemas(
    {
        twitchParamsSchema,
        twitchTokenQuerySchema,
        twitchTokenResponseSchema,
    },
    {
        $id: 'TwitchSchemas',
    },
)
