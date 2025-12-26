import type { Command } from '@lib/bot/types.js'

const anniversary: Command = {
    name: 'anniversary',
    aliases: ['anni'],
    enabled: false,
    async execute(event, _args, apiClient) {
        const broadcaster = event.broadcasterDisplayName
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `@${broadcaster}'s stream anniversary celebration is september 27 - september 30! 
            During this time we have various sub goals and individual sub rewards that you can see by using !subgoal.
            All proceeds will be going to updating my pngtuber model!`,
        )
    },
}
export default anniversary
