import { loadCommands } from '../lib/utils'

export function onConnect(address: string, port: number) {
	// create db client, load commands into memory
	loadCommands()
	console.log(`connected to ${address}:${port}`)
}
