import { bot } from '../../bot.js'
import type { Command } from '../structures/CommandCache.js'

export const executeBaseCommand = async (command: string, args?: string[]) => {
	if (!args || args.length === 0) {
		// TODO: return command usage string

		return 'Usage: !editcom (command) (message)'
	}

	switch (command) {
		case 'editcom': {
			const action = args[0]
			if (!action) {
				return `Command ${action} does not exist or is not registered.`
			}

			action.replace('!', '').toLowerCase() // remove exclamation point if present
			const responseMsg = args.slice(1).join(' ')
			if (!bot.commandCache?.has(action)) {
				// return error msg
			}

			const command = bot.commandCache?.get(action) as Command
			command.response = responseMsg
			const updatedFields = new Map<string, unknown>([['response', command.response]])
			await bot.commandCache?.updateCommand(command, updatedFields)
			break
		}
		default:
			break
	}

	return
}
