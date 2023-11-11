import type { CommandCache } from '../structures/CommandCache'

declare module 'tmi.js' {
	export interface ClientBase {
		commandCache: CommandCache
	}
}
