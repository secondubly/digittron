import { bot } from '../bot.js'

export function onConnect() {
	// create db client, load commands into memory
	// bot.loadCommands()
	// bot.setupScheduler()
	console.log(`bot connected!`)
}
