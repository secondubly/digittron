type Command = {
	name: string
	aliases: string[]
	response: string
	enabled: boolean
	visible: boolean
}

export class CommandCache {
	cache: Map<string, Command> = new Map<string, Command>()

	constructor(commands: Command[]) {
		commands.forEach((command) => {
			this.cache.set(command.name, command)
		})
	}
}
