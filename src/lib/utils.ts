import { config } from 'dotenv'
config({ path: process.cwd() + '/src/.env' })
import { createClient } from 'redis'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import { AccessToken } from '@twurple/auth'
import { GetUsersResponse, User } from 'ts-twitch-api'
import { StatusCodes } from 'http-status-codes'
import { Logger } from './client/Logger'

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

export const getUsersData = async (users: string[]): Promise<User[] | null> => {
	let result: User[] | null = null
	try {
		const twitchBotID = await redisClient.get('twitch_bot_id')
		if (!twitchBotID) {
			throw Error('Twitch Bot ID not set, please re-run authentication.')
		}
		const stringToken = await redisClient.get(twitchBotID)
		let appAccessToken = stringToken ? (JSON.parse(stringToken) as AccessToken) : null
		if (!appAccessToken) {
			throw Error('Could not retrieve app access token.')
		}

		const searchParams = new URLSearchParams(users.map((user) => ['login', user]))
		const usersResponse = await fetch(`https://api.twitch.tv/helix/users?${searchParams}`, {
			method: 'GET',
			headers: new Headers({
				Authorization: `Bearer ${appAccessToken.accessToken}`,
				'Client-Id': process.env.CLIENT_ID ?? ''
			})
		})

		if (usersResponse.status === StatusCodes.UNAUTHORIZED) {
			// attempt access token refresh
			const refreshToken = appAccessToken.refreshToken
			if (!refreshToken) {
				console.log(appAccessToken)
				throw Error('Bot access token does not have a corresponding refresh token.')
			}

			appAccessToken = await refreshOauth(refreshToken)
			await redisClient.set(twitchBotID, JSON.stringify(appAccessToken))
			return getUsersData(users)
		} else if (!usersResponse.ok) {
			const errorMsg = `Something went wrong: ${usersResponse.statusText} (Status Code: ${usersResponse.status})`
			Logger.error(errorMsg)
		}

		const json = (await usersResponse.json()) as GetUsersResponse
		if (!json) {
			console.warn('User response object: ' + json)
			result = null
		} else {
			result = json.data as User[]
		}
	} catch (e) {
		console.error(e)
	}

	return result
}

export const refreshOauth = async (refreshToken: string): Promise<AccessToken> => {
	const url =
		'https://id.twitch.tv/oauth2/token?' +
		`client_id=${process.env.CLIENT_ID}` +
		`&client_secret=${process.env.CLIENT_SECRET}` +
		'&grant_type=refresh_token&' +
		`refresh_token=${encodeURIComponent(refreshToken)}`

	const response = await fetchWithRetries(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})

	if (!response.ok) {
		console.log(url)
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
