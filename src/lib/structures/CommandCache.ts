type Command = {
	name: string
	aliases: string[]
	response: string
	enabled: boolean
	visible: boolean
	permission: string
}

export class CommandCache {
	cache: Map<string, Command> = new Map<string, Command>()

	constructor(commands: Command[]) {
		commands.forEach((command) => {
			this.cache.set(command.name, command)
		})
	}

	set(command: Command) {
		this.cache.set(command.name, command)
	}

	get(command: string) {
		if (this.has(command)) {
			return this.cache.get(command)
		} else {
			return undefined
		}
	}

	has(command: string): boolean {
		return this.cache.has(command) ? true : false
	}
}
