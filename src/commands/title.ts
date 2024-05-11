import { Command } from '../types/command'
import { PermissionLevel } from '@prisma/client'
import { isNullOrEmpty } from 'lib/utils'

export const title: Command = {
	name: 'test',
	aliases: [],
	permission: PermissionLevel.BROADCASTER,
	callback: async (client, author, channel, ...args: unknown[]): Promise<void> => {
		if (args.length > 0) {
			// TODO: check for mods and broadcasters
			if (author !== 'secondubly') {
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
					client.say(channel, `@${author} Successfully updated stream title to “${title}”`)
				} catch (e) {
					client.say(channel, 'Something went wrong, sorry!')
				}
			}
		} else {
			const userData = await client.api.users.getUserByName(channel)
			if (!userData) {
				throw Error(`Could not get user data for ${channel}`)
			}

			const channelData = await client.api.channels.getChannelInfoById(userData)
			if (!channelData) {
				throw Error(`Could not get stream title for ${channel}`)
			}

			client.say(channel, `@${author} stream title: “${title}”`)
		}
		client.say(channel, 'this is a test of the emergency bot broadcasting system!')
	}
}
