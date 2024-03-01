import { createContext } from '@secondubly/digittron-db'
import { PermissionLevel } from '@prisma/client'
import type { CommandOptions, Command } from './Command'
const { prisma } = await createContext()

export type ParsedCommand = {
	name: string
	aliases: string[]
	response: string
	enabled: boolean
	visible: boolean
	permission: keyof typeof PermissionLevel
}

export class CommandCache {
	cache: Record<CommandOptions['name'], Command> = {}

	constructor(commands: Command[]) {
		commands.forEach((command) => {
			this.cache[command.options.name] = command
		})
	}

	set(command: Command) {
		this.cache[command.options.name] = command
	}

	get(command: string) {
		return this.cache[command]
	}

	async updateCommand(command: Command, updatedFields: Record<string, string | string[] | boolean | null>) {
		this.set(command)
		prisma.commands.update({
			where: {
				name: command.options.name
			},
			data: {
				name: updatedFields['name'] as string,
				aliases: updatedFields['aliases'] as string[],
				response: updatedFields['response'] as string,
				enabled: updatedFields['enabled'] as boolean,
				visible: updatedFields['visible'] as boolean
			}
		})
	}
}
