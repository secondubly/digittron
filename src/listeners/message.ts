import type { ChatUserstate } from 'tmi.js'
import commandHandler from '../lib/commands/commandHandler'

export function onMessage(channel: string, state: ChatUserstate, message: string, self: boolean) {
	if (self) return
	// TODO: command handler
	if(message.trim().startsWith('!')) {
		commandHandler.runCommand(channel, message)
	}
}
