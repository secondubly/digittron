import type { CommandContext, Command } from '../types.js'

const discord: Command = {
    name: 'discord',
    aliases: [],
    description: 'the stream discord url',
    async execute({ say }: CommandContext) {
        say(
            `join the discord here: ${process.env.DISCORD_URL ?? 'http://discord.gg/6EtUH9X'}`,
        )
    },
}

export default discord
