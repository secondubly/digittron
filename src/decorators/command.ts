import { Command } from '../types/command'

export function command(opts: Command) {
	return (target: unknown, methodName: string): void => {
		const data = {
			...opts,
			fnc: methodName,
			enabled: opts.enabled ?? true
		}
	}
}
