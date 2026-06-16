import type { CommandContext } from '@lib/bot/types'
import type { Command } from '@lib/bot/types.js'

const discord: Command = {
    name: 'discord',
    aliases: [],
    description: 'the stream discord url',
    async execute({ msg, say }: CommandContext) {
        say(`join the discord here: ${process.env.DISCORD_URL}`)
    },
}

export default discord
