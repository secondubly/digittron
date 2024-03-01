import { CommandArgument } from '../structures/Command.js'

type Command = {
	name: string
	args: string[]
}
// TODO: make static class
export class CommandHandler {
	public static async run(channel: string, message: string, author?: string) {
		const command = this.parse(message)
		if (!command) {
			return
		}
	}

	private static parse(message: string): Command | undefined {
		const regex = /\!(.*?)$/gm //eslint-disable-line
		const fullCommand = regex.exec(message)

		if (fullCommand) {
			// position 0 is the command delimiter
			const splitCommand = fullCommand[1].split(' ')
			const command = splitCommand[0]

			splitCommand.shift()
			return {
				name: command,
				args: splitCommand
			} as Command
		}

		return undefined
	}

	public static parseArguments(input: string): CommandArgument[] {
		// parse out any arguments from the response string
	}
}
