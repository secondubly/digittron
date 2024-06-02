import { createContext } from '@secondubly/digittron-db'
const { prisma } = await createContext()
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth'
import { ChatUserstate, Client } from '@twurple/auth-tmi'
import { EventSubClient } from './lib/client/EventSubClient.js'
import { getUsersData, redisClient } from './lib/utils.js'
import { ApiClient } from '@twurple/api'
import { EventEmitter } from 'events'
import { Logger as Log } from './lib/client/Logger.js'
import { CommandHandler } from './handlers/commandHandler.js'
import { Spotify } from './lib/utils/SongRequest.js'
import { cache } from './lib/cache.js'
import { getUserRank } from './helpers/getUserRank.js'

type DigittronConfig = {
	prefix: string
	channels: string[]
	CLIENT_ID: string
	CLIENT_SECRET: string
	ENV?: string
}

export class DigittronClient extends EventEmitter {
	private id: string = ''
	public db = prisma
	public tmi!: Client
	public api!: ApiClient
	public auth: RefreshingAuthProvider
	public eventSub!: EventSubClient
	private config: DigittronConfig
	private handler: typeof CommandHandler
	private songHandler: typeof Spotify
	constructor(config: DigittronConfig) {
		super()

		this.config = config
		this.handler = CommandHandler
		this.handler.setupClient(this)
		this.songHandler = Spotify

		this.auth = new RefreshingAuthProvider({
			clientId: this.config.CLIENT_ID,
			clientSecret: this.config.CLIENT_SECRET
		})

		this.auth.onRefresh(async (userId, newTokenData) => {
			// REVIEW: do we need to await this?
			await redisClient.set(userId, JSON.stringify(newTokenData))
		})

		this.auth.onRefreshFailure((userId) => {
			Log.warn(`User ${userId} needs to reauthenticate.`)
		})

		this.connect()
	}

	async connect(): Promise<void> {
		this.id = (await redisClient.get('twitch_bot_id')) ?? this.id

		if (this.id === '') {
			throw Error('Bot ID could not be found.')
		}

		const token = await redisClient.get(this.id)
		if (!token) {
			throw Error('Bot access token not found, please reauthenticate.')
		}

		const botAccessToken = JSON.parse(token) as AccessToken
		// force token refresh
		botAccessToken.expiresIn = 0
		botAccessToken.obtainmentTimestamp = 0
		this.auth.addUser(this.id, botAccessToken, ['chat'])

		// get all channel tokens
		const userData = await getUsersData(this.config.channels)
		if (!userData || userData.length === 0) {
			console.warn('User Data object: ' + userData)
			throw new Error('No user data found for config twitch channels')
		}

		const userIds = userData.map((user) => user.id)
		const tokens = await redisClient.MGET(userIds) // NOTE: MGET guarantees return order https://github.com/redis/redis/issues/4647
		for (const [idx, token] of tokens.entries()) {
			if (!token) {
				continue
			}
			const accessToken = JSON.parse(token) as AccessToken
			this.auth.addUser(userIds[idx], accessToken)
		}
		await cache.loadBotCommands()

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

		this.tmi.on('message', this.onMessage.bind(this))
		this.tmi.on('join', this.onJoin.bind(this))
		// @ts-ignore: there is an overload constructor that matches this call
		this.tmi.on('redeem', this.onRedeem.bind(this))
		this.tmi.on('connected', (address: string, port: number) => {
			Log.info(`Connected to ${address}:${port}`)
		})

		await this.tmi.connect()
	}

	getChannels() {
		return this.config.channels
	}

	getUsername() {
		return this.tmi.getUsername()
	}

	getBotOwners() {
		return []
	}

	async say(channel: string, message: string): Promise<[string]> {
		return await this.tmi.say(channel, message)
	}

	private async onMessage(channel: string, tags: ChatUserstate, message: string, self: boolean): Promise<void> {
		if (self) {
			return
		}

		// bot.updateChatActivity(channel)
		this.emit('message', message)

		if (message.trim().startsWith('!')) {
			this.handler.processCmd(channel, message, tags.username)
		}
	}

	private async onJoin(channel: string, user: string) {
		// get user id
		try {
			const userInfo = await this.api.users.getUserByName(user)
			const channelData = await this.api.users.getUserByName(channel.slice(1))
			if (!userInfo || !channelData) {
				return
			}

			if (cache.users.has(userInfo.id)) {
				return
			}

			// add user to cache
			cache.users.set(userInfo.id, {
				id: userInfo.id,
				name: userInfo.name,
				rank: await getUserRank(this.api, channelData, userInfo),
				watchTime: 0
			})
		} catch (e) {
			if (e instanceof Error) {
				Log.error(e.message, e.stack)
			}
		}
	}

	private async onRedeem(channel: string, username: string, rewardType: string, _tags: ChatUserstate, message: string): Promise<void> {
		if (rewardType === process.env.TWITCH_SONG_REQUEST_REWARD_ID) {
			try {
				const result = await this.songHandler.addSongToQueue(message)
				if (result === undefined) {
					this.say(channel, 'Could not find a song with that information.')
				} else {
					const { song, index: position } = result
					this.say(channel, `@${username} successfully added ${song.artists[0]} - ${song.track} at position ${position}`)
				}
			} catch (e) {
				if (e instanceof Error) {
					Log.error(e.message, e.stack)
				}
			}
		}
	}
}
