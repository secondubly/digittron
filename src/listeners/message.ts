import type { ChatUserstate } from 'tmi.js'
import commandHandler from '../lib/commands/commandHandler.js'

export function onMessage(channel: string, state: ChatUserstate, message: string, self: boolean) {
	if (self) return
	if (message.trim().startsWith('!')) {
		commandHandler.runCommand(channel, message, state.username)
	}
}
