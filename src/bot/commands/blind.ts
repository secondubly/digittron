import type { Command } from '@lib/types.js'

const blind: Command = {
    name: 'blind',
    aliases: [],
    enabled: true,
    description: 'Explanation of blind playthroughs',
    async execute(event, _args, apiClient) {
        apiClient?.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            `This is a first time playthrough, please do not backseat or give fake spoilers. If the streamer needs help, they will ask designated chatters. All questions are rhetorical unless otherwise stated.`,
        )
    },
}

export default blind
