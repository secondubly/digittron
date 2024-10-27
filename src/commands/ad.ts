import { DigittronClient } from 'client'
import { Command } from 'lib/structures/Command'
import { UserData } from 'types/UserData'
import { CommandType, PermissionLevel } from '@prisma/client'
import { CommercialLength } from '@twurple/api'
import { Logger } from '../lib/client/Logger.js'

const VALID_DURATION = [30, 60, 90, 120, 150, 180]
class AdCommand extends Command {
	id?: string | undefined
	type: CommandType
	name: string
	aliases: string[]
	description?: string | undefined
	permission: $Enums.PermissionLevel
	enabled?: boolean | undefined
	hidden?: boolean | undefined

	constructor() {
		super()
		this.type = CommandType.DEFAULT
		this.name = 'ad'
		this.aliases = []
		this.permission = PermissionLevel.BROADCASTER
	}

	async callback(client: DigittronClient, user: UserData, channel: string, args: unknown[]): Promise<void> {
		if (user.rank !== PermissionLevel.BROADCASTER) {
			return
		}

		if (!args || args.length === 0) {
			client.say(channel, 'Insufficient arguments provided.')
			return
		}

		const userData = await client.api.users.getUserByName(channel)
		if (!userData) {
			throw Error(`Could not get user data for ${channel}`)
		}

		if (!VALID_DURATION.includes(args[0] as number)) {
			client.say(channel, `Invalid duration provided. Valid durations include: ${VALID_DURATION.join(', ')}`)
			return
		}

		const duration = args[0] as CommercialLength
		const silent = args[1] === 'silent' ? true : false

		try {
			client.api.channels.startChannelCommercial(userData, duration)
			if (!silent) {
				client.say(channel, `A commerical will be starting soon and will last ${duration} seconds`)
			}
		} catch (e) {
			client.say(channel, 'Something went wrong, please try again')
			if (e instanceof Error) {
				client.say(channel, 'Something went wrong, please try again!')
				Logger.error(e.message)
			}
		}
	}
}
