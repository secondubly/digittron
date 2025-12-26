import type { Command } from '@lib/bot/types.js'

const subgoal: Command = {
    name: 'subgoal',
    aliases: [],
    enabled: false,
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            'all sub goals can be found here: https://microbin.secondubly.tv/upload/eel-snail-bee',
        )
    },
}

export default subgoal
