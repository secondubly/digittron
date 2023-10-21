import type { ChatUserstate } from 'tmi.js'
import { resolver as resolve } from '../lib/commands/commandResolver'

export function onMessage(channel: string, state: ChatUserstate, message: string, self: boolean) {
	if (self) return
	// TODO: command handler
	if(message.trim().startsWith('!')) {
		resolve(channel, state, message)
	}
}
