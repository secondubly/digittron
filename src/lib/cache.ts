import { Command } from './structures/Command.js'
import { createContext } from '@secondubly/digittron-db'
import { HelixCustomReward } from '@twurple/api'
import { CommandType } from '@prisma/client'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library.js'
import { test } from '../commands/test.js'
import { title } from '../commands/title.js'
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
	}

	async loadBotCommands() {
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

			this.loadDefaultCommands()
		} catch (err) {
			if (err instanceof PrismaClientInitializationError) {
				if (err.errorCode === 'P1001') {
					// try to reconnect
					Logger.info('Attempting to reconnect to database')
					await prisma.$connect()
				}
				console.error(err)
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
