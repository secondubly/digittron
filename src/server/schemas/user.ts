import { type Static, Type } from 'typebox'

// registration schema (only useable by admin)
export const createUserSchema = Type.Object(
    {
        username: Type.String({
            minLength: 1,
        }),
        password: Type.String({
            minLength: 6,
        }),
    },
    { $id: 'CreateUserSchema' },
)

export const createUserResponseSchema = Type.Object(
    {
        id: Type.String(),
        username: Type.String(),
    },
    { $id: 'CreateUserResponseSchema' },
)

export const loginSchema = Type.Object({
    username: Type.String(),
    password: Type.String({
        minLength: 6,
    }),
})

export type CreateUserInput = Static<typeof createUserSchema>
export type LoginUserInput = Static<typeof loginSchema>
export const loginResponseSchema = Type.Object({
    accessToken: Type.String(),
})
