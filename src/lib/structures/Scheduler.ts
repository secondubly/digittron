export class Scheduler {
	public messages: string[] = []

	constructor(
		public nextMessage: number = 0,
		public chatActivity: number = 0,
		public channel: string | undefined = undefined
	) {}
}
