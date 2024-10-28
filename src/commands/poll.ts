import { CommandType, PermissionLevel } from '@prisma/client'
import { DigittronClient } from 'client'
import { Command } from '../lib/structures/Command'
import { UserData } from 'types/UserData'
import { Logger } from '../lib/client/Logger.js'
import { api } from 'helpers/twurple'

class PollCommand extends Command {
	id?: string | undefined
	type: CommandType
	name: string
	aliases: string[]
	description?: string | undefined
	permission: PermissionLevel
	enabled?: boolean | undefined
	hidden?: boolean | undefined

	constructor() {
		super()
		this.type = CommandType.DEFAULT
		this.name = 'poll'
		this.aliases = []
		this.permission = PermissionLevel.MODERATOR
	}

	async callback(client: DigittronClient, user: UserData, channel: string, args: unknown[]): Promise<void> {
		if (user.rank !== PermissionLevel.MODERATOR && user.rank != PermissionLevel.BROADCASTER) {
			return
		}

		if (args.length === 0) {
			client.say(channel, 'Insufficient arguments provided, please try again!')
			return
		}

		const splitArgs = args
			.join(' ')
			.split('|')
			.map((str) => str.trim())

		if (splitArgs.length < 3) {
			client.say(channel, 'Insufficient arguments provided, please try again!')
			return
		}

		const arrLength = splitArgs.length
		const title = splitArgs[0]
		const duration = !Number.isNaN(Number(splitArgs[arrLength - 1])) ? Number(splitArgs[arrLength - 1]) : 60
		const choices = !Number.isNaN(Number(splitArgs[arrLength - 1])) ? splitArgs.slice(1, arrLength - 2) : splitArgs.slice(1, arrLength)

		if (choices.length < 2) {
			client.say(channel, 'At least two choices are required!')
			return
		} else if (choices.length > 5) {
			client.say(channel, 'No more than five choices are allowed!')
			return
		}

		const userData = await api.users.getUserByName(channel)
		if (!userData) {
			throw Error(`Could not get user data for ${channel}`)
		}

		const channelData = await api.channels.getChannelInfoById(userData)
		if (!channelData) {
			throw Error(`Could not get channel data for ${channel}`)
		}

		try {
			await api.polls.createPoll(channelData.id, {
				title,
				choices,
				duration
			})
			client.say(channel, `Poll “${title}” successfully created.`)
			return
		} catch (e) {
			client.say(channel, 'Something went wrong, please try again')
			if (e instanceof Error) {
				client.say(channel, 'Something went wrong, please try again!')
				Logger.error(e.message)
			}
		}
	}
}

export const poll = new PollCommand()
