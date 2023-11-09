import { type Options } from 'tmi.js'
import { config } from 'dotenv'
import { createClient } from 'redis'
import fetch, { Headers } from 'node-fetch'
config({ path: process.cwd() + '/src/.env' })

type Nullish = null | undefined
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
	const keyExists = await redisClient.exists('oauth')
	let oauthKey = undefined
	if (keyExists) {
		oauthKey = (await redisClient.get('oauth')) as string
	} else {
		oauthKey = process.env.BOT_OAUTH_TOKEN as string
	}

	// validate oauth token
	const tokenIsValid = validateOauthToken(oauthKey)
	redisClient.set('oauth', oauthKey)

	return `oauth:${oauthKey}`
}

async function validateOauthToken(token: string): Promise<boolean> {
	const meta = {
		Authorization: `OAuth ${token}`
	}

	const headers = new Headers(meta)
	const response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: headers
	})
	const data = (await response.json()) as TwitchResponse

	if (data.status === 401) {
		// attempt to refresh token
		const refresh_token = (await redisClient.get('refresh_token')) ?? process.env.BOT_REFRESH_TOKEN
		const oauthToken = await refreshToken(refresh_token!)
	}

	return true
}

async function refreshToken(refreshToken: string): Promise<string> {
	const params = new URLSearchParams()
	params.append('client_id', process.env.CLIENT_ID!)
	params.append('client_secret', process.env.CLIENT_SECRET!)
	params.append('grant_type', 'refresh_token')
	params.append('refresh_token', refreshToken)

	const response = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', body: params })
	const data = (await response.json()) as RefreshTokenResponse

	if (data.status === 400 || data.status === 401) {
		console.warn('Refresh token was invalid, please have user reauthenticate!')
		process.exit(1) // gracefully exit in case there are pending processes
	} else if (data.access_token !== undefined) {
		// got a new access token
		redisClient.set('oauth', `${data.access_token}`)
		redisClient.set('refresh_token', data.refresh_token!)
	}

	return `oauth:${data.access_token}`
}

export { isNullOrUndefinedOrEmpty as isNullOrEmpty }
