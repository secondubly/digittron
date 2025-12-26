import type { Command } from '@lib/bot/types.js'

const roulette: Command = {
    name: 'roulette',
    aliases: [],
    cooldown: 60000, // cooldown in milliseconds
    enabled: true,
    async execute(event, _args, apiClient) {
        const bullet = Math.floor(Math.random() * 6 + 1)

        const isMod = await apiClient.moderation.checkUserMod(
            event.broadcasterId,
            event.chatterId,
        )
        const isBroadcaster = event.chatterId === process.env.TWITCH_ID
        const isSubscriber =
            await apiClient.subscriptions.checkUserSubscription(
                event.chatterId,
                event.broadcasterId,
            )

        if (bullet === 1) {
            if (isMod || isBroadcaster || isSubscriber) {
                apiClient.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    event.broadcasterId,
                    `the gun fired, but ${event.chatterDisplayName} caught the bullet!`,
                )
            } else {
                apiClient.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    event.broadcasterId,
                    `${event.chatterDisplayName} was shot!`,
                )
                apiClient.moderation.banUser(event.broadcasterId, {
                    duration: 600, // 10 minutes
                    reason: 'lost the roulette game',
                    user: event.chatterId,
                })
            }
        } else {
            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `${event.chatterDisplayName} was spared!`,
            )
        }
    },
}
export default roulette
