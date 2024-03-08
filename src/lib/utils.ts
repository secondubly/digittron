import { config } from 'dotenv'
config({ path: process.cwd() + '/src/.env' })
import { createClient } from 'redis'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import { AccessToken } from '@twurple/auth'
import { GetUsersResponse, User } from 'ts-twitch-api'
import type { CommandArgument } from '../lib/structures/Command'

export const redisClient = await createClient({
	url: 'redis://redis:6379'
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
		const appAccessToken = await redisClient.get('app_access_token')
		if (!appAccessToken) {
			throw Error('Could not get app access token, please reauthenticate your bot account.')
		}

		const searchParams = new URLSearchParams(users.map((user) => ['login', user]))
		const usersResponse = await fetch(`https://api.twitch.tv/helix/users?${searchParams}`, {
			method: 'GET',
			headers: new Headers({
				Authorization: `Bearer ${appAccessToken}`,
				'Client-Id': process.env.CLIENT_ID ?? ''
			})
		})

		if (!usersResponse.ok) {
			// TODO: check if access token expired
			return null
		}

		const json = (await usersResponse.json()) as GetUsersResponse
		if (!json) {
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
