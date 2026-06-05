import { Role, type Command } from '@lib/types.js'

const test: Command = {
    name: 'test',
    aliases: [],
    enabled: true,
    description: 'Sample command triggerable only by the broadcaster.',
    permissions: [Role.Broadcaster],
    async execute(event, _args, apiClient) {
        apiClient.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            event.broadcasterId,
            'this is a test of the emergency bot system! 🚨',
        )
    },
}

export default test
