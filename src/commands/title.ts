import { Command } from '../lib/structures/Command.js'
import { CommandType, PermissionLevel } from '@prisma/client'
import { DigittronClient } from '../client.js'
import { UserData } from '../types/UserData.js'
import { isNullOrEmpty } from '../lib/utils'
import { api } from '../helpers/twurple.js'

class TitleCommand extends Command {
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
		this.name = 'title'
		this.aliases = []
		this.permission = PermissionLevel.VIEWER
	}

	async callback(client: DigittronClient, user: UserData, channel: string, args: unknown[]): Promise<void> {
		if (args.length === 0) {
			const userData = await api.users.getUserByName(channel)
			if (!userData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			const channelData = await api.channels.getChannelInfoById(userData)
			if (!channelData) {
				throw Error(`Could not get stream title for ${channel}`)
			}

			client.say(channel, `@${user.name} stream title: “${channelData.title}”`)
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

			const channelData = await api.users.getUserByName(channel)
			if (!channelData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			try {
				await api.channels.updateChannelInfo(channelData.id, { title })
				client.say(channel, `@${user.name} Successfully updated stream title to “${title}”`)
			} catch (e) {
				client.say(channel, 'Something went wrong, sorry!')
			}
		}
	}
}

export const title = new TitleCommand()
