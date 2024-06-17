import { Command } from '../lib/structures/Command'
import { CommandType, PermissionLevel } from '@prisma/client'
import { DigittronClient } from 'client'
import { UserData } from 'types/UserData'
import { isNullOrEmpty } from '../lib/utils'
import { ApiClient, HelixGame } from '@twurple/api'

class GameCommand extends Command {
	id?: string
	type: CommandType
	name: string
	aliases: string[]
	description?: string
	permission: PermissionLevel
	enabled?: boolean
	hidden?: boolean

	constructor() {
		super()
		this.type = CommandType.DEFAULT
		this.name = 'game'
		this.aliases = []
		this.permission = PermissionLevel.VIEWER
	}

	async callback(client: DigittronClient, user: UserData, channel: string, args: unknown[]): Promise<void> {
		if (args.length === 0) {
			const userData = await client.api.users.getUserByName(channel)
			if (!userData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			const channelData = await client.api.channels.getChannelInfoById(userData)
			if (!channelData) {
				throw Error(`Could not get game for ${channel}`)
			}

			client.say(channel, `@${user.name} currently playing: “${channelData.gameName}”`)
			return
		}

		if (user.rank !== PermissionLevel.BROADCASTER && user.rank !== PermissionLevel.MODERATOR) {
			return
		} else {
			const title = args.join(' ')
			if (isNullOrEmpty(title)) {
				client.say(channel, 'Invalid command, please try again!')
				return
			}

			const channelData = await client.api.users.getUserByName(channel)
			if (!channelData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			try {
				const game = await this.getGame(title, client.api)
				if (game === undefined) {
					client.say(channel, `Could not find a game with the name ${title}`)
					return
				}

				await client.api.channels.updateChannelInfo(channelData.id, { gameId: game.id })
				client.say(channel, `@${user.name} Successfully updated game to “${game.name}”`)
			} catch (e) {
				client.say(channel, 'Something went wrong, sorry!')
			}
		}
	}

	async getGame(title: string, api: ApiClient): Promise<HelixGame | undefined> {
		const game = await api.games.getGameByName(title)
		if (!game) {
			return undefined
		}

		return game
	}
}

export const game = new GameCommand()
