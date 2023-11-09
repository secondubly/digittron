import { client } from './client'
import { onConnect } from './listeners/connect'
import { onMessage } from './listeners/message'

client.on('connected', onConnect)

client.on('message', onMessage)

await client.connect().catch(async (err) => {
	console.error(err)
})
