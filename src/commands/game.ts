import { Command } from '../lib/structures/Command.js'
import { DigittronClient } from 'client'
import { UserData } from '../types/UserData.js'
import { isNullOrEmpty } from '../lib/utils.js'
import { ApiClient, HelixGame } from '@twurple/api'
import { PermissionLevel, CommandType } from '@prisma/client'
import { api } from '../helpers/twurple.js'

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
		if (!args.length) {
			const userData = await api.users.getUserByName(channel)
			if (!userData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			const channelData = await api.channels.getChannelInfoById(userData)
			if (!channelData) {
				throw Error(`Could not get game for ${channel}`)
			}

			client.say(channel, `@${user.name} currently playing: “${channelData.gameName}”`)
			return
		}

		if (user.rank !== PermissionLevel.BROADCASTER && user.rank !== PermissionLevel.MODERATOR) {
			return
		} else {
			const gameName = args.join(' ')
			if (isNullOrEmpty(gameName)) {
				client.say(channel, 'Invalid command, please try again!')
				return
			}

			const channelData = await api.users.getUserByName(channel)
			if (!channelData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			try {
				// TODO: rewrite method
				const game = await this.getGame(gameName, api)
				if (game === undefined) {
					client.say(channel, `Could not find a game with the name ${game}`)
					return
				}

				await api.channels.updateChannelInfo(channelData.id, { gameId: game.id })
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
