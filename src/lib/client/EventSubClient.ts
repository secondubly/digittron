import { ApiClient, HelixUser } from '@twurple/api'
import { DigittronClient } from '../../client'
import { CustomRewardsCache } from '../structures/CustomRewardsCache.js'
import { ConnectionAdapter, EventSubHttpListener } from '@twurple/eventsub-http'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'
import { HttpStatusCodeError } from '@twurple/api-call'
import { StatusCodes } from 'http-status-codes'
import { getParameterByName } from '../utils.js'

export class EventSubClient {
	private client: DigittronClient
	private rewards!: CustomRewardsCache
	private user!: HelixUser

	constructor(client: DigittronClient) {
		this.client = client
		this.loadCustomRewards()
	}

	private async loadCustomRewards(): Promise<void> {
		try {
			const channelPointRewards = (await this.client.api.channelPoints.getCustomRewards(this.user.id)) ?? []
			this.rewards = new CustomRewardsCache(channelPointRewards)
			return
		} catch (e) {
			if (e instanceof HttpStatusCodeError && e.statusCode === StatusCodes.FORBIDDEN) {
				const id = getParameterByName('broadcaster_id', e.url)
				console.warn(`User ${id} is not an Affiliate or Partner`)
			}
		}
	}

	async connect() {
		const apiClient = new ApiClient({
			authProvider: this.client.auth,
			logger: {
				timestamps: true,
				colors: true,
				emoji: true,
				minLevel: 3
			}
		})

		await apiClient.eventSub.deleteAllSubscriptions()

		const adapter: ConnectionAdapter = new NgrokAdapter({
			ngrokConfig: {
				authtoken: process.env.NGROK_AUTH_TOKEN
			}
		})
		// if (process.env.NODE_ENV) {
		// 	adapter = new NgrokAdapter({
		// 		ngrokConfig: {
		// 			authtoken: process.env.NGROK_AUTH_TOKEN
		// 		}
		// 	})
		// } else {
		// 	adapter = new DirectConnectionAdapter({
		// 		// TODO: replace this with .env values
		// 		hostName: 'example.com',
		// 		sslCert: {
		// 			key: 'aaaaaaaaaaaaaaa',
		// 			cert: 'bbbbbbbbbbbbbbb'
		// 		}
		// 	})
		// }
		const listener = new EventSubHttpListener({
			apiClient: this.client.api,
			adapter,
			secret: process.env.LISTENER_SECRET ?? 'thisShouldBeARandomlyGeneratedFixedStringA'
		})

		listener.start()

		if (!this.user) {
			const channelName = this.client.getChannels().map((channel) => channel.substring(1))
			this.user = (await this.client.api.users.getUserByName(channelName[0])) as HelixUser
		}

		// bind song request
		// TODO: generalize this method
		listener.onChannelRedemptionAddForReward(
			this.user.id,
			process.env.TWITCH_SONG_REQUEST_REWARD_ID!,
			({ userName: username, rewardCost, rewardTitle, broadcasterName }) => {
				this.client.say(broadcasterName, `${username} redeemed ${rewardTitle} for ${rewardCost}`)
			}
		)
	}
}
