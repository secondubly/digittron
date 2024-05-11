import { PermissionLevel, CommandType } from '@prisma/client'
import { DigittronClient } from '../client'

export interface Command {
	id?: string
	type?: CommandType.E
	name: string
	aliases: string[]
	description?: string
	permission?: PermissionLevel
	enabled?: boolean
	hidden?: boolean
	callback: (client: DigittronClient, author: string | undefined, channel: string, ...args: unknown[]) => unknown
}

export interface ParsedCommand {
	name: string
	author?: string
	source: string
	command: Command
	args?: string[]
}
