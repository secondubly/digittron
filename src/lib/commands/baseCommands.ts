import { client } from '../../client.js'
import type { Command } from '../structures/CommandCache.js'

export const executeBaseCommand = async (command: string, args?: string[]) => {
	if (!args || args.length === 0) {
		// TODO: return command usage string

		return 'Usage: !editcom (command) (message)'
	}

	if (command === 'editcom') {
		const action = args[0]
		if (!action) {
			return `Command ${action} does not exist or is not registered.`
		}

		action.replace('!', '').toLowerCase() // remove exclamation point if present
		const responseMsg = args.slice(1).join(' ')
		if (!client.commandCache.has(action)) {
			// return error msg
		}

		const command = client.commandCache.get(action) as Command
		command.response = responseMsg
		const updatedFields = new Map<string, unknown>([['response', command.response]])
		await client.commandCache.updateCommand(command, updatedFields)
		return
	}
}
