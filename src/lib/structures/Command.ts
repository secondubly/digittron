import { PermissionLevel, CommandType } from '@prisma/client'
import { DigittronClient } from '../../client'
import { UserData } from '../../types/UserData'

export abstract class Command {
	abstract id?: string
	abstract type: CommandType
	abstract name: string
	abstract aliases: string[]
	abstract description?: string
	abstract permission: PermissionLevel
	abstract enabled?: boolean
	abstract hidden?: boolean
	abstract callback(client: DigittronClient, user: UserData, channel: string, ...args: unknown[]): void
	canExecute(author: UserData): boolean {
		if (author.rank !== this.permission) {
			return false
		}
		return true
	}
}

export interface ParsedCommand {
	name: string
	author?: string
	source: string
	command: Command
	args?: string[]
}
