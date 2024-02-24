export abstract class Command {
	constructor(
		public name: string,
		public description: string,
		private cooldown: number,
		public enabled: boolean,
		public permissionLevel: string
	) {}

	getCooldown() {
		return this.cooldown
	}
	abstract exec(): unknown
}
