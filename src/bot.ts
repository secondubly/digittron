import { client } from './client'
import { onConnect } from './listeners/connect'
import { onMessage } from './listeners/message'

await client.connect().catch(async (err) => {
	console.error(err)
})

client.on('connected', onConnect)

client.on('message', onMessage)
