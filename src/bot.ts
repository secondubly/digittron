import { client } from './client'
import { onConnect } from './listeners/connect'

let tryCount = 0
console.log('hello')
await client.connect().catch(async (err: any) => {
	tryCount++
	// TODO: refresh token and try connection again
	console.error(err)
	if (tryCount < 3) {
		await client.connect()
	}
})

client.on('connected', onConnect)

client.on('message', (channel, tags, message, self) => {
	if (self) return
	if (message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`)
	}
})
