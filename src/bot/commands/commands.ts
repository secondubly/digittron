import type { CommandContext, CommandDeps } from '@lib/bot/types'
import { config } from 'src/config/env'

const commands = ({ registry }: CommandDeps) => ({
    name: 'commands',
    aliases: [],
    enabled: true,
    description: 'Lists all available commands',
    async execute({ client, msg }: CommandContext) {
        const { chatterDisplayName, broadcasterId } = msg
        const commands = registry.list().join()

        client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            broadcasterId,
            `@${chatterDisplayName} available commands: ${commands}`,
        )
    },
})

export default commands
