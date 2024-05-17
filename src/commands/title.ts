import { Command } from 'lib/structures/Command'
import { CommandType, PermissionLevel } from '@prisma/client'
import { DigittronClient } from 'client'
import { UserData } from 'types/UserData'
import { isNullOrEmpty } from 'lib/utils'

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

	async callback(client: DigittronClient, user: UserData, channel: string, ...args: unknown[]): Promise<void> {
		if (args.length === 0) {
			const userData = await client.api.users.getUserByName(channel)
			if (!userData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			const channelData = await client.api.channels.getChannelInfoById(userData)
			if (!channelData) {
				throw Error(`Could not get stream title for ${channel}`)
			}

			client.say(channel, `@${user.name} stream title: “${channelData.title}”`)
			return
		}

		// TODO: check for mods and broadcaster
		if (user.name !== 'secondubly') {
			return
		} else {
			const title = args[0] as string
			if (isNullOrEmpty(title)) {
				client.say(channel, 'Invalid command, please try again!')
				return
			}

			const channelData = await client.api.users.getUserByName(channel)
			if (!channelData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			try {
				await client.api.channels.updateChannelInfo(channelData.id, { title })
				client.say(channel, `@${user.name} Successfully updated stream title to “${title}”`)
			} catch (e) {
				client.say(channel, 'Something went wrong, sorry!')
			}
		}
	}
}
