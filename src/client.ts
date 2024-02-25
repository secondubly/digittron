import { createContext } from '@secondubly/digittron-db'
const { prisma } = await createContext()
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { Client } from '@twurple/auth-tmi'
import { EventSubClient } from './lib/client/EventSubClient.js'
import { CommandCache } from './lib/structures/CommandCache.js'
import { redisClient, getUserData } from './lib/utils.js'
import { ApiClient } from '@twurple/api'
import { EventEmitter } from 'events'
import { HelixUserData } from '@twurple/api/lib/interfaces/endpoints/user.external.js'

type DigittronConfig = {
	prefix: string
	channels: string[]
	CLIENT_ID: string
	CLIENT_SECRET: string
	botAccessToken: AccessToken
	ENV?: string
}

export class DigittronClient extends EventEmitter {
	private id: string
	public tmi: Client
	public api: ApiClient
	public auth: RefreshingAuthProvider
	public eventSub: EventSubClient
	public commands: CommandCache
	private config: DigittronConfig
	constructor(config: DigittronConfig) {
		super()

		this.commands = new CommandCache([])
		this.config = config

		this.auth = new RefreshingAuthProvider({
			clientId: this.config.CLIENT_ID,
			clientSecret: this.config.CLIENT_SECRET
		})

		this.auth.onRefresh(async (userId, newTokenData) => {
			// REVIEW: do we need to await this?
			await this.updateToken(userId, newTokenData)
		})

		this.auth.onRefreshFailure((userId) => {
			console.warn(`User ${userId} needs to reauthenticate!`)
		})

		this.connect()
	}

	async updateToken(id: string, token: AccessToken) {
		const stringToken = JSON.stringify(token)
		if (this.id === '') {
			const user = (await getUserData(token)) as HelixUserData
			this.id = user.id
			redisClient.set('twitch_bot_id', user.id)
		} else if (id === this.id) {
			await redisClient.set('twitch_bot_token', stringToken)
		} else {
			await redisClient.set('twitch_broadcaster_token', stringToken)
		}
	}

	async connect(): Promise<void> {
		const botAccessToken = this.config.botAccessToken
		const broadcasterToken: AccessToken = JSON.parse((await redisClient.get('twitch_broadcaster_token')) as string)
		this.id = (await redisClient.get('twitch_bot_id')) ?? ''

		// force token refresh
		botAccessToken.expiresIn = 0
		botAccessToken.obtainmentTimestamp = 0

		await this.auth.addUserForToken(botAccessToken, ['chat'])
		await this.auth.addUserForToken(broadcasterToken)

		await this.loadCommands()

		this.api = new ApiClient({
			authProvider: this.auth,
			logger: {
				timestamps: true,
				colors: true,
				emoji: true,
				minLevel: 3
			}
		})

		this.tmi = new Client({
			options: {
				debug: true
			},
			connection: {
				secure: true,
				reconnect: true
			},
			authProvider: this.auth,
			channels: this.config.channels
		})

		this.eventSub = new EventSubClient(this)
		await this.eventSub.connect()
	}

	private async loadCommands(): Promise<void> {
		try {
			const commands = await prisma.commands.findMany({
				include: {
					command_permissions: {
						select: {
							level: true
						}
					}
				}
			})

			const parsedCommands = commands.map((command) => {
				return {
					name: command.name,
					aliases: command.aliases as string[],
					response: command.response,
					enabled: command.enabled,
					visible: command.visible,
					permission: command.command_permissions!.level as string
				}
			})

			this.commands = new CommandCache(parsedCommands)
		} catch (err) {
			console.log(err)
		}
	}

	getChannels() {
		return this.config.channels
	}

	async say(channel: string, message: string): Promise<[string]> {
		return await this.tmi.say(channel, message)
	}
}
