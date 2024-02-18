import commandHandler from '../lib/commands/commandHandler.js'
import type { ChatMessage } from '@twurple/chat'
import { bot } from '../bot.js'

export function onMessage(channel: string, user: string, text: string, message: ChatMessage) {
	if (self) return
	// bot.updateChatActivity(channel)

	if (text.trim().startsWith('!')) {
		commandHandler.runCommand(channel, text, user)
	}
}
