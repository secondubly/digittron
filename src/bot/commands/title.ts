import type { Command } from '@lib/bot/types.js'

const title: Command = {
    name: 'title',
    aliases: [],
    enabled: true,
    async execute(event, args, apiClient) {
        const channelInfo = await apiClient.channels.getChannelInfoById(
            event.broadcasterId,
        )
        if (!channelInfo) {
            return
        }

        if (!args.length) {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `@${event.chatterDisplayName}, title: ${channelInfo.title}`,
            )
        } else {
            const isMod = await apiClient.moderation.checkUserMod(
                event.broadcasterId,
                event.chatterId,
            )
            const isBroadcaster = event.chatterId === process.env.TWITCH_ID
            if (!isMod && !isBroadcaster) {
                return
            }

            const streamTitle = args.join()

            apiClient.channels.updateChannelInfo(event.broadcasterId, {
                title: streamTitle,
            })

            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `@${event.chatterDisplayName} updated game title to: ${streamTitle}.`,
            )
        }
    },
}

export default title
