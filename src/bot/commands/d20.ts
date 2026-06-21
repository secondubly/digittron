import type { Command, CommandContext } from '../types.js'

const d20: Command = {
  name: 'd20',
  aliases: [],
  description: 'Roll a d20',
  execute: async function ({ msg, say }: CommandContext): Promise<void> {
    const displayName = msg.chatterDisplayName
    const roll = Math.floor(Math.random() * 20 + 1)
    say(`${displayName} rolled a ${roll}${roll === 20 ? '! 🎉' : ''}`)
    //  TODO: track nat 20s and nat 1s
  },
}

export default d20
