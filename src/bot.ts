import { TwitchBot } from './client.js'
import { envParseArray } from './lib/utils.js'
import { onMessage } from './listeners/onMessage.js'

export const bot = new TwitchBot(
	process.env.NODE_ENV ? ['thirdadentally'] : envParseArray('TWITCH_CHANNELS', []),
	process.env.CLIENT_ID as string,
	process.env.CLIENT_SECRET as string,
	onMessage
)
