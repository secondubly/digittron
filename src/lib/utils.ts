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

	// validate oauth token
	const tokenIsValid = await validateOauthToken(oauthKey)
	if (!tokenIsValid) {
		const token = (await redisClient.get('bot_refresh_token')) as string
		oauthKey = await refreshToken(token)
	}

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

	return data.status === 401 ? false : true
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
		redisClient.set('bot_access_token', `${data.access_token}`)
		redisClient.set('bot_refresh_token', data.refresh_token!)
	}

	return `oauth:${data.access_token}`
}

export { isNullOrUndefinedOrEmpty as isNullOrEmpty }
