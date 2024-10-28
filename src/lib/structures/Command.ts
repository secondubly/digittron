import { PermissionLevel, CommandType } from '@secondubly/digittron-db'
import { DigittronClient } from '../../client.js'
import { UserData } from '../../types/UserData'

export abstract class Command {
	abstract id?: string
	abstract type: CommandType
	abstract name: string
	abstract aliases: string[]
	abstract description?: string
	abstract permission: PermissionLevel
	abstract enabled?: boolean
	abstract hidden?: boolean
	abstract callback(client: DigittronClient, user: UserData, channel: string, ...args: unknown[]): void
	canExecute(author: UserData): boolean {
		return author.rank === this.permission
	}
}
