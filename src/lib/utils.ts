import { type Options } from 'tmi.js'
import { config } from 'dotenv'
import { createClient } from 'redis'
config({ path: process.cwd() + '/src/.env'})

type Nullish = null | undefined


export const redisClient = await createClient({
	url: process.env.REDIS_URL
})
	.on('error', err => console.error('Redis Client Error', err))
	.connect()

export const CLIENT_OPTIONS: Options = {
	options: {
		debug: process.env.NODE_ENV === 'development' ? true : false
	},
	channels: envParseArray('TWITCH_CHANNELS', []),
	identity: {
		username: process.env.BOT_USERNAME,
		password: await getOauthToken()
	}
}

export function envParseArray(key: string, defaultValue: string[]) {
	const value = process.env[key]
	if (!value) {
		if (defaultValue === void 0) throw new ReferenceError(`[ENV] ${key} - The key must be an array, but is empty or undefined.`)
		return defaultValue
	}
	return value.split(' ')
}

function isNullOrUndefinedOrEmpty<T>(value: unknown): value is null | undefined | '' {
	if (value === undefined || value === null) {
		return true   
	} else if (typeof value === 'string' && value === '') {
		return true
	} else {     
		return false   
	} 
}

async function getOauthToken(): Promise<string> {
	const value = await redisClient.get('oauth') || ''
	return value
}

export { isNullOrUndefinedOrEmpty as isNullOrEmpty }