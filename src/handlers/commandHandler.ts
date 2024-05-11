import { findBotCommand } from '../helpers/findBotCommand.js'
import { Command, ParsedCommand } from '../types/command.js'
import { DigittronClient } from '../client.js'
import { PermissionLevel } from '@prisma/client'
import { Logger } from '../lib/client/Logger.js'

export class CommandHandler {
	static client: DigittronClient
	constructor(c: DigittronClient) {
		CommandHandler.client = c
	}

	public static setupClient(client: DigittronClient) {
		this.client = client
	}

	public static async processCmd(channel: string, message: string, author?: string) {
		const parsedCommand = this.parse(message, channel, author)
		if (!parsedCommand) {
			return
		}

		if (this.runAllChecks(parsedCommand.command, author) === false) {
			return
		}

		if (!this.client) {
			Logger.warn('Client has not been initialized, no messages can be sent!')
		} else {
			parsedCommand.command.callback(this.client, author, channel.substring(1), parsedCommand.args)
		}
	}

	private static parse(message: string, channel: string, author?: string): ParsedCommand | undefined {
		const regex = /!(\S+)(?:\s)*(.*)$/gm //eslint-disable-line
		const fullCommand = regex.exec(message)?.filter((match) => match !== null && match !== undefined && match !== '')
		if (fullCommand) {
			fullCommand.shift()
			const args = fullCommand[1] ? fullCommand[1].split(' ') : null
			const commandName = fullCommand[0]
			const command = findBotCommand(commandName)

			if (!command) {
				return
			}

			return {
				name: commandName,
				author,
				source: channel,
				command,
				args
			} as ParsedCommand
		}

		return
	}

	private static runAllChecks(command: Command, author?: string): boolean {
		if (command.permission === PermissionLevel.BROADCASTER && author !== 'secondubly') {
			return false
		}

		return true
	}
}
