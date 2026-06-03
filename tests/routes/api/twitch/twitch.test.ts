import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { build } from '../../../helper.js'

describe('Twitch API', () => {
    it('/token should have response status 400 when missing params', async (t) => {
        const server = await build(t)
        const response = await server.inject({
            method: 'GET',
            url: '/api/twitch/token',
        })
        assert.strictEqual(response.statusCode, 400)
    })

    it('/token should have response status 200 when given an id', async (t) => {
        const server = await build(t)

        // we need properly encode the params before sending them
        const params = {
            id: 'test',
        }
        const url = new URL('http://localhost:4000/api/twitch/token')
        url.search = new URLSearchParams(params).toString()

        const response = await server.inject({
            method: 'GET',
            url: url,
        })

        assert.strictEqual(response.statusCode, 200)
    })
})
