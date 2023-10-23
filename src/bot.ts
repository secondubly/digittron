import { client } from './client'
import { onConnect } from './listeners/connect'
import { onMessage } from './listeners/message'

let tryCount = 0
await client.connect().catch(async (err: any) => {
	console.error(err)
})

client.on('connected', onConnect)

client.on('message', onMessage)
