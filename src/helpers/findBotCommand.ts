import { cache } from '../lib/cache.js'

export const findBotCommand = (command: string) => {
	const commands = cache.getBotCommands()
	return commands.find((com) => com.name === command)
}
