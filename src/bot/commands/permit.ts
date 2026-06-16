import type { Command, CommandContext } from '@lib/bot/types'
import { log } from '@lib/services/logger'
import { config } from 'src/config/env'

const permitList = new Map<string, number>()
const PERMIT_DURATION_MS = 60_999

export function isPermitted(userId: string): boolean {
    const expiresAt = permitList.get(userId)
    if (!expiresAt) return false
    // you're only allowed to post one link, so delete them from the permit list if they're in it
    permitList.delete(userId)
    if (Date.now() > expiresAt) {
        return false
    }
    return true
}

export default (): Command => ({
    name: 'permit',
    aliases: ['allow'],
    description: 'Allow a user to post a link',
    modOnly: true,
    async execute({ client, msg, args, say }: CommandContext) {
        const target = args[0]?.replace('@', '').toLocaleLowerCase()
        const { broadcasterId } = msg
        if (!target) {
            say(`Invalid command! Usage: !permit @username`)
            return
        }

        const targetUser = await client.users.getUserByName(target)
        if (!targetUser) {
            say(`User @${target} not found.`)
            return
        }

        permitList.set(targetUser.id, Date.now() + PERMIT_DURATION_MS)
        say(
            `@${targetUser.displayName}, you may post one link in the next 60 seconds.`,
        )

        log.bot.info(`Permit granted to ${targetUser.displayName}`)
    },
})
