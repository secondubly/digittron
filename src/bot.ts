import { client } from './client.js'
import { onConnect } from './listeners/connect.js'
import { onMessage } from './listeners/message.js'

client.on('connected', onConnect)

client.on('message', onMessage)

await client.connect().catch(async (err) => {
	console.error(err)
})
