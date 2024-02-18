import { config } from 'dotenv'
import { createClient } from 'redis'
import fetch, { Headers } from 'node-fetch'
config({ path: process.cwd() + '/src/.env' })

type TwitchResponse = {
	client_id?: string
	login?: string
	scopes?: string[]
	user_id?: string
	expires_in?: number
	status?: number
	message?: string
}

type RefreshTokenResponse = {
	access_token?: string
	expires_in?: number
	refresh_token?: string
	scope?: string[]
	token_type?: string
	error?: string
	status?: number
	message?: string
}

export const redisClient = await createClient({
	url: process.env.REDIS_URL
})
	.on('error', (err) => console.error('Redis Client Error', err))
	.connect()

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

export async function getOauthToken(): Promise<string> {
	const keyExists = await redisClient.exists('bot_access_token')
	let oauthKey = undefined
	if (keyExists) {
		oauthKey = (await redisClient.get('bot_access_token')) as string
	} else {
		oauthKey = process.env.BOT_OAUTH_TOKEN as string
	}

	return `oauth:${oauthKey}`
}

export { isNullOrUndefinedOrEmpty as isNullOrEmpty }
