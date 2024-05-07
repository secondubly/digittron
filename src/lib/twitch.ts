import { command } from '../decorators/command'

class Twitch {
	@command({
		name: 'test',
		aliases: [],
		description: 'this is a test',
		response: 'hello!'
	})
	async sendTest() {
		return 'hello!'
	}
}

export default new Twitch()
