import { $Enums, CommandType, PermissionLevel } from '.prisma/client'
import { DigittronClient } from 'client'
import { Logger } from 'lib/client/Logger'
import { Command } from 'lib/structures/Command'
import { secondsToHms } from 'lib/utils'
import { UserData } from 'types/UserData'

class MarkerCommand extends Command {
	id?: string | undefined
	type: $Enums.CommandType
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
		const userData = await client.api.users.getUserByName(channel)
		if (!userData) {
			throw Error(`Could not get user data for ${channel}`)
		}
		let description = undefined
		if (args.length > 0) {
			description = args.join(' ')
		}

		try {
			const marker = await client.api.streams.createStreamMarker(userData.id, description)
			const response = description
				? `Stream marker created at: ${secondsToHms(marker.positionInSeconds)} with description: ${description}`
				: `Stream marker created at: ${secondsToHms(marker.positionInSeconds)}`
			client.say(channel, response)
		} catch (e) {
			if (e instanceof Error) {
				client.say(channel, 'Something went wrong, please try again!')
				Logger.error(e.message)
			}
		}
	}
}

export const marker = new MarkerCommand()
