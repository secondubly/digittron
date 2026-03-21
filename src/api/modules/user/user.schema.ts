import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

// registration schema (only useable by admin)
const createUserSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

const createUserResponseSchema = z.object({
    id: z.string(),
    username: z.string(),
})

// login schema
const loginSchema = z.object({
    username: z.string({
        required_error: 'Username is required',
        invalid_type_error: 'Username must be a string',
    }),
    password: z.string().min(6),
})

export type LoginUserInput = z.infer<typeof loginSchema>
const loginResponseSchema = z.object({
    accessToken: z.string(),
})

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema,
})
