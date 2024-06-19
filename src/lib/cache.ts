import { Command } from './structures/Command.js'
import { createContext } from '@secondubly/digittron-db'
import { HelixCustomReward } from '@twurple/api'
import { CommandType } from '@prisma/client'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library.js'
import { game } from '../commands/game.js'
import { test } from '../commands/test.js'
import { title } from '../commands/title.js'
import { poll } from '../commands/poll.js'
import { Logger } from './client/Logger.js'
import type { UserData } from 'types/UserData'
const { prisma } = await createContext()

class Cache {
	private commands: Record<string, Command> = {}
	public channelPointRewards: Record<string, HelixCustomReward[]> = {}
	public commandAliases: Record<string, Command> = {}
	public users: Map<string, UserData> = new Map()

	init() {
		this.loadBotCommands()
	}

	loadDefaultCommands() {
		this.commands['test'] = test
		this.commands['title'] = title
		this.commands['game'] = game
		this.commands['poll'] = poll
	}

	async loadBotCommands() {
		this.loadDefaultCommands()

		try {
			const results = await prisma.commands.findMany({
				include: {
					command_permissions: {
						select: {
							level: true
						}
					}
				}
			})

			results.forEach((cmd) => {
				this.commands[cmd.name] = {
					type: CommandType.CUSTOM,
					name: cmd.name,
					aliases: cmd.aliases,
					description: '',
					permission: cmd.command_permissions.level,
					enabled: true,
					hidden: false
				} as Command
			})
		} catch (e) {
			if (e instanceof PrismaClientInitializationError) {
				if (e.errorCode === 'P1001') {
					// try to reconnect
					Logger.info('Attempting to reconnect to database')
					await prisma.$connect()
				}
				console.error(e)
			}
		}
	}

	getBotCommands(): Command[] {
		return Object.values(this.commands)
	}

	getUser(username: string) {
		return [...this.users.values()].find((user) => user.name === username)
	}

	setUser(user: UserData) {
		this.users.set(user.id, user)
	}
}

export const cache = new Cache()
