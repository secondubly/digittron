import { PermissionLevel } from '@prisma/client'

export interface Command {
	id?: string
	type?: 'custom' | 'default'
	name: string
	response?: string
	description: string
	aliases: string[]
	permission?: PermissionLevel
	enabled?: boolean
	args?: CommandOptions
}

export interface CommandOptions {
	message: string
	command: Command
	argument: string
}
