import type { Command } from '@lib/types.js'

const raidmsg: Command = {
    name: 'raidmsg',
    aliases: [],
    enabled: true,
    description: 'the channel’s raid message',
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            'raid message: second15Raid 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15Raid',
        )
    },
}

export default raidmsg
