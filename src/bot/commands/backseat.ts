import type { Command } from '@lib/bot/types.js'
import { config } from 'src/config/env'

const backseat: Command = {
    name: 'backseat',
    aliases: [],
    description: 'Warning about backseating',
    execute: async function ({ channel, say }) {
        say(
            `Please do not backseat the streamer! when @${channel} needs help, they will ask for it! Thank you!`,
        )
    },
}

export default backseat
