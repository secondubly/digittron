import { Command } from './structures/Command.js'
import { HelixCustomReward, HelixUser } from '@twurple/api'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library.js'
import { game } from '../commands/game.js'
import { test } from '../commands/test.js'
import { title } from '../commands/title.js'
import { poll } from '../commands/poll.js'
import { Logger } from './client/Logger.js'
import type { UserData } from 'types/UserData'
import { marker } from 'commands/marker.js'
import prisma from 'helpers/prisma.js'
import { api } from 'helpers/twurple.js'
import { envParseArray } from './utils.js'
import { getUserRank } from 'helpers/getUserRank.js'

class Cache {
	private commands: Record<string, Command> = {}
	private broadcaster?: HelixUser
	public channelPointRewards: Record<string, HelixCustomReward[]> = {}
	public commandAliases: Record<string, Command> = {}
	public users: Map<string, UserData> = new Map()

	init() {
		this.loadBotCommands()
		this.setBroadcasterId()
	}

	loadDefaultCommands() {
		this.commands['game'] = game
		this.commands['marker'] = marker
		this.commands['poll'] = poll
		this.commands['test'] = test
		this.commands['title'] = title
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

	async setBroadcasterId() {
		const channels = envParseArray('TWITCH_CHANNELS', [])
		if (!channels.length) {
			throw Error('Could not retrieve Broadcaster ID, please check your .env file')
		}
		const broadcaster = await api.users.getUserByName(channels[0])
		if (!broadcaster) {
			throw Error('Could not retrieve Broadcaster ID from Twitch API!')
		}

		this.broadcaster = broadcaster
	}

	getBotCommands(): Command[] {
		return Object.values(this.commands)
	}

	async getUser(username: string): Promise<UserData> {
		let user = [...this.users.values()].find((user) => user.name === username)
		if (!user) {
			// TODO: make sure to check db first, then ping twitch api
			const helixUser = await api.users.getUserByName(username)
			if (!helixUser) {
			}
			// TODO: store in DB
			user = {
				id: helixUser?.id,
				name: helixUser?.name,
				rank: getUserRank(this.broadcaster as HelixUser, helixUser as HelixUser),
				watchTime: 0

			} as UserData
			cache.setUser(user)
		}

		return user
	}

	setUser(user: UserData) {
		this.users.set(user.id, user)
	}
}

export const cache = new Cache()
