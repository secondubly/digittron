import test from 'node:test'
import assert from 'node:assert'
import { build } from '../helper.js'

test('/healthcheck should have response status 200', async (t) => {
  const server = await build(t)
  const response = await server.inject({
    method: 'GET',
    url: '/health',
  })
  assert.deepStrictEqual(response.statusCode, 200)
})
