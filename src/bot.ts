import { type AccessToken } from '@twurple/auth'
import { envParseArray, redisClient } from './lib/utils.js'
import { DigittronClient } from './client.js'

const bot = new DigittronClient({
	prefix: '!',
	channels: process.env.NODE_ENV ? ['thirdadentally'] : envParseArray('TWITCH_CHANNELS', []),
	CLIENT_ID: process.env.CLIENT_ID as string,
	CLIENT_SECRET: process.env.CLIENT_SECRET as string
})
