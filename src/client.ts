const { prisma } = await createContext()
import { ChatClient, ChatMessage } from '@twurple/chat'
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { createContext } from '@secondubly/digittron-db'
import { CommandCache } from './lib/structures/CommandCache.js'
import { Scheduler } from './lib/structures/Scheduler.js'
import { ApiClient } from '@twurple/api'
import { CustomRewardsCache } from './lib/structures/CustomRewardsCache.js'
import { getParameterByName, getUserData, redisClient } from './lib/utils.js'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import { EventSubHttpListener } from '@twurple/eventsub-http'
import { onChannelRedemptionAdd } from './listeners/onChannelRedemptionAdd.js'
import { HttpStatusCodeError } from '@twurple/api-call'
import { StatusCodes } from 'http-status-codes'

export class TwitchBot {
	private client?: ChatClient
	private apiClient?: ApiClient
	private httpListener?: EventSubHttpListener
	public commandCache?: CommandCache
	public rewardsCache?: CustomRewardsCache
	public scheduler?: Scheduler
	public id?: string

	constructor(
		private channels: string[],
		private clientID: string | undefined,
		private clientSecret: string | undefined,
		private messageCallback: (channel: string, user: string, message: string, info: ChatMessage) => void
	) {
		this.init()
	}

	private async init(): Promise<void> {
		if (this.channels.length === 0 || !this.clientID || !this.clientSecret) {
			throw new Error('\x1b[41m[INFO] Channels, Client ID or Client Secret is not set!\x1b[0m')
		}

		const botAccessToken = await redisClient.get('twitch_bot_token')
		if (!botAccessToken) {
			throw new Error('\x1b[41m[INFO] Bot access token not found!\x1b[0m')
		}

		const parsedBotToken: AccessToken = JSON.parse(botAccessToken)
		const tokenData: AccessToken = {
			accessToken: parsedBotToken.accessToken,
			refreshToken: parsedBotToken.refreshToken,
			// auto-refresh the bot access token on startup
			expiresIn: 0,
			obtainmentTimestamp: 0,
			scope: parsedBotToken.scope
		}

		const authProvider = new RefreshingAuthProvider({
			clientId: this.clientID,
			clientSecret: this.clientSecret
		})

		this.id = (await redisClient.get('twitch_bot_id')) ?? undefined
		authProvider.onRefresh(async (userId: string, newTokenData: AccessToken) => {
			const stringToken = JSON.stringify(newTokenData)
			if (userId === this.id) {
				await redisClient.set('twitch_bot_token', stringToken)
			} else if (!this.id) {
				// get and set bot id
				const user = await getUserData(newTokenData)
				this.id = user?.id
				if (user?.id) {
					redisClient.set('twitch_bot_id', user.id)
				}
			} else {
				await redisClient.set('twitch_broadcaster_token', stringToken)
			}
		})

		// adds bot auth token for automatic refreshing
		await authProvider.addUserForToken(tokenData, ['chat'])

		// add broadcaster auth token for automatic refreshing
		const broadcasterCachedToken = process.env.NODE_ENV
			? await redisClient.get('test_broadcaster_token')
			: await redisClient.get('twitch_broadcaster_token')
		if (!broadcasterCachedToken) {
			throw new Error('\x1b[41m[INFO] Broadcaster access token not found!\x1b[0m')
		}
		const parsedBroadcasterToken: AccessToken = JSON.parse(broadcasterCachedToken)
		await authProvider.addUserForToken(parsedBroadcasterToken)

		this.apiClient = new ApiClient({
			authProvider
		})

		this.client = new ChatClient({
			authProvider,
			channels: this.channels,
			isAlwaysMod: true,
			logger: {
				minLevel: process.env.NODE_ENV ? 'DEBUG' : 'INFO'
			}
		})

		this.client.onMessage((channel, user, msg, info) => {
			this.messageCallback(channel, user, msg, info)
		})

		await this.apiClient?.eventSub.deleteAllSubscriptions()

		const user = await this.apiClient?.users.getUserByName(this.channels[0])
		await this.setupEventListener() // REVIEW: should we move this into start?
		if (this.httpListener) {
			this.httpListener.start()
			this.httpListener.onChannelRedemptionAdd(user!.id, ({ userName: username, rewardCost, rewardTitle, broadcasterName }) => {
				onChannelRedemptionAdd(username, rewardCost, rewardTitle, broadcasterName, this.client)
			})
		}

		await this.start()
	}

	private async start(): Promise<void> {
		await this.loadCommands()
		await this.loadCustomRewards()
		this.setupScheduler()
		this.client?.connect()
		this.client?.onAuthenticationSuccess(() => {
			console.log(`[${new Date().toISOString()}] \x1b[32m[INFO] Connected!\x1b[0m`)
		})
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

	async loadCustomRewards(): Promise<void> {
		try {
			const user = await this.apiClient?.users.getUserByName(this.channels[0])
			const channelPointRewards = (await this.apiClient?.channelPoints.getCustomRewards(user!.id)) ?? []
			this.rewardsCache = new CustomRewardsCache(channelPointRewards)
		} catch (e) {
			if (e instanceof HttpStatusCodeError && e.statusCode === StatusCodes.FORBIDDEN) {
				const id = getParameterByName('broadcaster_id', e.url)
				console.warn(`User ${id} is not an Affiliate or Partner`)
			}
		}
	}

	setupScheduler(): void {
		this.scheduler = new Scheduler()
	}

	async updateChatActivity(channel: string) {
		if (!this.scheduler) {
			throw Error('\x1b[41m[INFO] Scheduler not initialized!\x1b[0m')
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

	async setupEventListener() {
		if (!this.apiClient) {
			throw new Error('\x1b[41m[INFO] Broadcaster access token not found!\x1b[0m')
		}

		this.httpListener = new EventSubHttpListener({
			adapter: new NgrokAdapter({
				ngrokConfig: {
					authtoken: process.env.NGROK_AUTH_TOKEN
				}
			}),
			apiClient: this.apiClient,
			secret: process.env.LISTENER_SECRET ?? 'thisShouldBeARandomlyGeneratedFixedString'
		})
	}
}
