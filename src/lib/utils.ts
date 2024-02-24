import { config } from 'dotenv'
import { createClient } from 'redis'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import { HelixUserData } from '@twurple/api/lib/interfaces/endpoints/user.external'
import { AccessToken } from '@twurple/auth'
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

const fetchWithRetries = async (url: string, options: RequestInit, retryCount = 0, maxRetries = 3): Promise<Response> => {
	try {
		return await fetch(url, options)
	} catch (error) {
		// if the retryCount has not been exceeded, call again
		if (retryCount < maxRetries) {
			return fetchWithRetries(url, options, retryCount + 1)
		}
		// max retries exceeded
		throw error
	}
}

export const getUserData = async (authToken: AccessToken, username?: string): Promise<HelixUserData | null> => {
	const headers = new Headers()
	const url = username ? `https://api.twitch.tv/helix/users?login=${username}` : 'https://api.twitch.tv/helix/users'
	let e

	headers.append('Authorization', `Bearer ${authToken}`)
	headers.append('Client-Id', process.env.TWITCH_CLIENT_ID!)
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers
		})

		if (!response.ok) {
			// manually refresh oauth token and try again
			const refreshToken = (await redisClient.get('twitch_bot_token')) ?? null
			if (!refreshToken) {
				throw Error('No refresh token found!')
			}

			const parsedToken = JSON.parse(refreshToken) as AccessToken
			const authToken = refreshOauth(parsedToken.refreshToken!)

			await redisClient.set('bot_access_token', JSON.stringify(authToken))
		}

		const result = (await response.json()) as HelixUserData
		if (!result) {
			return null
		} else {
			return result
		}
	} catch (err) {
		e = err
	}
	// should never fire
	throw e
}

export const refreshOauth = async (refreshToken: string): Promise<AccessToken> => {
	const url =
		'https://id.twitch.tv/oauth2/token?' +
		`client_id=${process.env.PUBLIC_TWITCH_CLIENT_ID}` +
		`&client_secret=${process.env.TWITCH_CLIENT_SECRET}` +
		'&grant_type=refresh_token&' +
		`refresh_token=${encodeURIComponent(refreshToken)}`

	const response = await fetchWithRetries(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})

	if (!response.ok) {
		throw Error('Invalid Response ' + response.statusText)
	}

	const result = (await response.json()) as AccessToken
	return result
}

export const getParameterByName = (name: string, url = window.location.href) => {
	name = name.replace(/[\\[\]]/g, '\\$&')
	const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url)
	if (!results) return null
	if (!results[2]) return ''
	return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export { isNullOrUndefinedOrEmpty as isNullOrEmpty }
