import type { Command } from '../types.js'
import type { CommandContext } from '../types'

const subgoal: Command = {
  name: 'subgoal',
  aliases: [],
  enabled: false,
  description: 'list of subscriber goals during the subathon',
  async execute({ say }: CommandContext) {
    say('all sub goals can be found here: https://microbin.secondubly.tv/upload/eel-snail-bee')
  },
}

export default subgoal
