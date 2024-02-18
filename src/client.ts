import { ChatClient, ChatMessage } from '@twurple/chat'
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { getOauthToken, redisClient } from './lib/utils.js'
import { createContext } from '@secondubly/digittron-db'
const { prisma } = await createContext()
// @ts-ignore removes complaints about requiring ESNext
import config from '../scopes.json' assert { type: 'json' }
import { CommandCache } from './lib/structures/CommandCache.js'
import { Scheduler } from './lib/structures/Scheduler.js'

export class TwitchBot {
	private client?: ChatClient
	public commandCache?: CommandCache
	public scheduler?: Scheduler

	constructor(
		private channels: string[],
		private clientID: string | undefined,
		private clientSecret: string | undefined,
		private messageCallback: (channel: string, user: string, text: string, msg: ChatMessage) => void
	) {
		this.init()
	}

	private async init(): Promise<void> {
		if (this.channels.length === 0 || !this.clientID || !this.clientSecret) {
			throw new Error('\x1b[41m[INFO] Channels, Client ID or Client Secret is not set!\x1b[0m')
		}

		const tokenData: AccessToken = {
			accessToken: await getOauthToken(),
			refreshToken: await redisClient.get('bot_refresh_token'),
			// auto-refresh the bot access token on startup
			expiresIn: 0,
			obtainmentTimestamp: 0,
			scope: Object.keys(config)
		}

		const authProvider = new RefreshingAuthProvider({
			clientId: this.clientID,
			clientSecret: this.clientSecret
		})

		authProvider.onRefresh(async (_: string, newTokenData: AccessToken) => {
			await redisClient.set('bot_access_token', newTokenData.accessToken)
			await redisClient.set('bot_refresh_token', newTokenData.refreshToken ?? 'undefined')
		})

		await authProvider.addUserForToken(tokenData)

		this.client = new ChatClient({
			authProvider,
			channels: this.channels,
			isAlwaysMod: true
		})
		this.start()
	}

	private async start(): Promise<void> {
		await this.client?.connect()
		console.log('\x1b[42m\x1b[34m[INFO] Connected!.\x1b[0m')
	}

	async loadCommands(): Promise<void> {
		if (!this.client) {
			throw Error('\x1b[41m[INFO] Client not initialized!\x1b[0m')
		}
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

			this.commandCache = new CommandCache(parsedCommands)
		} catch (err) {
			console.log(err)
		}
	}

	async setupScheduler(): Promise<void> {
		this.scheduler = new Scheduler()
	}

	async updateChatActivity(channel: string) {
		if (!this.scheduler) {
			throw Error('\x1b[41m[INFO] Client not initialized!\x1b[0m')
		}
		this.scheduler.chatActivity++
		this.scheduler.channel = channel
	}

	async send(channel: string, message: string): Promise<void> {
		if (!this.channels.includes(channel)) {
			throw Error("\x1b[41m[INFO] I can't send messages in that channel!\x1b[0m")
		}
		this.client?.say(channel, message)
	}
}
