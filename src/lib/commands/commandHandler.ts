import { CommandArgument } from '../structures/Command.js'


private const 
// TODO: make static class
export class CommandHandler {
	public static async run(channel: string, message: string, author?: string) {}

	private static parse(message: string) {
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

	public static parseArguments(input: string): CommandArgument[] {
		// parse out any arguments from the response string
	}
}
