import type { Command } from '../types.js'

const test: Command = {
  name: 'test',
  aliases: ['test'],
  description: 'Tests whether the bot is active in the chat or not.',
  execute: async function ({ say }): Promise<void> {
    const message =
      'FFBot is an idle game, inspired on Final Fantasy, with over 133 characters! To join in, type !join. ' +
      'If you see a character you like at the top of the screen, type !hire to collect them. To change to them, ' +
      'type !change <character name> (e.g. !change Clive)'
    say(message)
  },
}
export default test
