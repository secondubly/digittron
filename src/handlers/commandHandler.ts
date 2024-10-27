import { DigittronClient } from '../client.js'
import { Logger } from '../lib/client/Logger.js'
import { cache } from '../lib/cache.js'
import { getUserRank } from '../helpers/getUserRank.js'
import prisma from 'helpers/prisma.js'

export class CommandHandler {
	static client: DigittronClient
	constructor(c: DigittronClient) {
		CommandHandler.client = c
	}

	public static async processCmd(channel: string, message: string, author?: string): Promise<string | undefined> {
		const parts = message.slice(1).split(" "); 
		const command = parts[0];
		const args = parts.slice(1);
		
		if (!author) {
			Logger.warn(`Message does not have a valid sender. (Message: ${message})`)
			return
		}
		
		let user = await cache.getUser(author)
	}
}
