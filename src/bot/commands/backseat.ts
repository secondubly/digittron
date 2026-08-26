import type { Command } from '../types.js'

const backseat: Command = {
  name: 'backseat',
  aliases: [],
  enabled: true,
  description: 'Warning about backseating',
  execute: async function ({ channel, say }) {
    say(
      `Please do not backseat the streamer! when @${channel} needs help, they will ask for it! Thank you!`,
    )
  },
}

export default backseat
