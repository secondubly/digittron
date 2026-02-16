import type { Command } from '@lib/bot/types.js'

const permit: Command = {
    name: 'permit',
    aliases: [],
    enabled: true,
    async execute(event, args, apiClient) {
        const isMod = await apiClient.moderation.checkUserMod(
            event.broadcasterId,
            event.chatterId,
        )
        const isBroadcaster = event.chatterId === process.env.TWITCH_ID
        // by this point this shouldn't fire but just in case, we have a second check
        if (!isMod && !isBroadcaster) {
            return
        }

        const username = args[0]
        const author = event.chatterDisplayName
        if (!username) {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `@${author} you didn't include the user to permit!`,
            )
            return
        } else {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `@${username} you have have been permitted 60 seconds to post a link!`,
            )
        }
    },
}

export default permit
