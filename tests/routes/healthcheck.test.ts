import { describe, expect, test } from 'vitest'
import { build } from '../helper.js'

describe('GET /ping returns “pong”', async () => {
    test('Should have response status 200', async () => {
        const server = await build()
        const response = await server.inject({
            method: 'GET',
            url: '/health',
        })
        expect(response.statusCode).toBe(200)
    })
})
