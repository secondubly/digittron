import { PermissionLevel } from '@prisma/client'
import { DigittronClient } from '../../client'

export interface CommandOptions {
	/**
	 * Command name
	 */
	name: string

	/**
	 * Userlevel access
	 */
	userlevel: keyof typeof PermissionLevel

	/**
	 * Command description (required for output to !help <command>)
	 */
	description?: string

	/**
	 * Command examples (requited for output to !help <command>)
	 */
	examples?: string[]
	/**
	 * Command arguments
	 */
	args?: CommandArgument[]
	/**
	 * Command aliases
	 */
	aliases?: string[]

	/**
	 * Hide command help output to `!commands`
	 */
	hideFromHelp?: boolean

	/**
	 * The command is available only on the bot channel
	 */
	botChannelOnly?: boolean

	/**
	 * TextCommand
	 */
	message?: string

	/**
	 * Whether command is enabled or not (defaults to true if not present)
	 */
	enabled?: boolean
}

export interface CommandArgument {
	/**
	 * Alias name
	 */
	name: string

	/**
	 * Value typesafe
	 */
	type: StringConstructor | NumberConstructor | BooleanConstructor

	/**
	 * Default value
	 */
	defaultValue?: string | number | boolean

	/**
	 * Prepare value
	 */
	// prepare?: (value: unknown, msg?: ChatMessage) => string | number | boolean | void
	prepare?: (value: unknown, msg?: string) => string | number | boolean | void
}
export type NamedParameters = Record<string, string | number | boolean>

export type CommandProvider = Record<string, CommandOptions>

export abstract class Command {
	constructor(
		public client: DigittronClient,
		public options: CommandOptions
	) {}

	// async onPubSub(event: PubSubRedemptionMessage, args?: string[]): Promise<void> {}

	// async execute(msg: ChatMessage): Promise<any> {}

	/**
	 * Method called when command is executed
	 *
	 * @param msg
	 * @param parameters
	 */
	abstract run(msg: string, parameters: unknown): Promise<unknown>

	/**
	 * Prepare the command to be executed
	 *
	 * @param msg
	 * @param parameters
	 */
	// async prepareRun(msg: ChatMessage, parameters: string[]): Promise<any> {
	// 	const namedParameters: NamedParameters = {}

	// 	if (this.options.args && this.options.args.length > 0) {
	// 		for (let i = 0; i < this.options.args.length; i++) {
	// 			const args = this.options.args[i]

	// 			if (parameters[i]) {
	// 				if (args.type) {
	// 					namedParameters[args.name] = args.type(parameters[i])
	// 				}

	// 				if (args.prepare) {
	// 					const preparedValue = args.prepare(namedParameters[args.name] || parameters[i])

	// 					if (preparedValue) {
	// 						namedParameters[args.name] = preparedValue
	// 					}
	// 				}
	// 			} else {
	// 				if (args.defaultValue) {
	// 					namedParameters[args.name] = args.defaultValue
	// 				} else {
	// 					namedParameters[args.name] = null
	// 				}
	// 			}
	// 		}
	// 	}

	// 	await this.run(msg, namedParameters)
	// }

	/**
	 * Check to make sure command can be executed
	 *
	 * @param msg
	 */
	// preValidate(msg: ChatMessage): string | boolean {
	// 	// TODO: withWhisper command option
	// 	if (msg.messageType === 'whisper') {
	// 		return 'This command can be executed only in the bot channel'
	// 	}

	// 	if (this.options.botChannelOnly) {
	// 		if (msg.channel.name !== this.client.getUsername()) {
	// 			return 'This command can be executed only in the bot channel'
	// 		}
	// 	}

	// 	if (this.options.userlevel === PermissionLevel.VIEWER) {
	// 		return true
	// 	}

	// 	let validationPassed = false

	// 	if (msg.author.isBroadcaster) {
	// 		validationPassed = true
	// 	}

	// 	if (msg.author.isModerator) {
	// 		validationPassed = true
	// 	}

	// 	if (this.options.userlevel === PermissionLevel.REGULAR) {
	// 		if (![...this.client.getBotOwners(), this.client.getUsername()].includes(msg.author.username)) {
	// 			return 'Only bot owners can execute this command'
	// 		}
	// 	}

	// 	if (this.options.userlevel === PermissionLevel.SUBSCRIBER) {
	// 		if (!validationPassed && !msg.author.isSubscriber) {
	// 			return 'Only subscribers can execute this command'
	// 		}
	// 	}

	// 	if (this.options.userlevel === PermissionLevel.VIP) {
	// 		if (!validationPassed && !msg.author.isVip) {
	// 			return 'Only VIPs'
	// 		}
	// 	}

	// 	if (this.options.userlevel === PermissionLevel.MODERATOR) {
	// 		if (!validationPassed) {
	// 			return 'This command can be executed only from the broadcaster'
	// 		}
	// 	}

	// 	if (this.options.userlevel === PermissionLevel.BROADCASTER) {
	// 		if (!msg.author.isBroadcaster) {
	// 			return 'This command can be executed only from a mod or the broadcaster'
	// 		}
	// 	}

	// 	return true
	// }

	/**
	 * Makes an API call and retturns the result
	 * @param url
	 */
	private static call(url: string) {}

	public static parseArguments(input: string) {}
}

// export abstract class Command {
// 	constructor(
// 		public name: string,
// 		public description: string,
// 		private cooldown: number,
// 		public enabled: boolean,
// 		public permissionLevel: string
// 	) {}

// 	getCooldown() {
// 		return this.cooldown
// 	}
// 	abstract exec(): unknown
// }
