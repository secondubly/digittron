import type { Command } from '@lib/types.js'

const subgoal: Command = {
    name: 'subgoal',
    aliases: [],
    enabled: false,
    description: 'list of subscriber goals during the subathon',
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            'all sub goals can be found here: https://microbin.secondubly.tv/upload/eel-snail-bee',
        )
    },
}

export default subgoal
