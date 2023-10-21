import { client } from './client'
import { onConnect } from './listeners/connect'
import { onMessage } from './listeners/message'

let tryCount = 0
await client.connect().catch(async (err: any) => {
	tryCount++
	// TODO: refresh token and try connection again
	console.error(err)
	if (tryCount < 3) {
		await client.connect()
	}
})

client.on('connected', onConnect)

client.on('message', onMessage)
