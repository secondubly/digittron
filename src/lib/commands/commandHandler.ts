import { client } from '../../client.js'
import { isNullOrEmpty } from '../utils.js'

class CommandHandler {
	runCommand(channel: string, message: string) {
		const { command, args } = this.parseCommand(message)

		if (isNullOrEmpty(command)) {
			return
		}

		if (client.commandCache.has(command)) {
			const foundCommand = client.commandCache.get(command)!
			client.say(channel, foundCommand.response)
		} else {
			return
		}
	}

	private parseCommand(message: string) {
		const regex = /\!(.*?)$/gm //eslint-disable-line
		const fullCommand = regex.exec(message)

		if (fullCommand) {
			// position 0 is the command delimiter
			const splitCommand = fullCommand[1].split(' ')
			const command = splitCommand[0]

			splitCommand.shift()
			return {
				command,
				args: splitCommand
			}
		}

		return {}
	}
}

export default new CommandHandler()
