import { DigittronClient } from 'client'
import { Command } from '../lib/structures/Command.js'
import { PermissionLevel, CommandType } from '@prisma/client'
import { UserData } from 'types/UserData'

class TestCommand extends Command {
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
		this.name = 'test'
		this.aliases = []
		this.permission = PermissionLevel.BROADCASTER
	}

	callback(client: DigittronClient, user: UserData, channel: string, ..._: unknown[]): void {
		if (this.canExecute(user)) {
			client.say(channel, 'this is a test of the emergency bot broadcasting system!')
		}
		return
	}

	canExecute(author: UserData): boolean {
		if (author.rank !== PermissionLevel.BROADCASTER && author.rank !== PermissionLevel.MODERATOR) {
			return false
		}

		return true
	}
}

export const test = new TestCommand()
