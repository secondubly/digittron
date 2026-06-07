import type { Command, CommandContext } from '@lib/bot/types.js'

const playlist: Command = {
    name: 'playlist',
    aliases: [],
    enabled: true,
    description: 'Get the streamer’s playlist',
    async execute({ msg, client }: CommandContext) {
        const { broadcasterId, chatterDisplayName } = msg
        client.chat.sendChatMessageAsApp(
            process.env.BOT_ID!,
            broadcasterId,
            `@${chatterDisplayName} starting soon playlist: https://open.spotify.com/playlist/666mjTAcb7PYiWEnincpNt?si=54d75be2632741ac`,
        )
    },
}

export default playlist
