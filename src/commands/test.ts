import { Command } from '../types/command'
import { PermissionLevel } from '@prisma/client'

export const test: Command = {
	name: 'test',
	aliases: [],
	permission: PermissionLevel.BROADCASTER,
	callback: (client, _, channel, ...args: unknown[]) => {
		client.say(channel, 'this is a test of the emergency bot broadcasting system!')
	}
}
