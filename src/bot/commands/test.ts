import type { Command } from '../types.js'

const test: Command = {
  name: 'test',
  aliases: ['test'],
  enabled: true,
  modOnly: true,
  description: 'Tests whether the bot is active in the chat or not.',
  execute: async function ({ say }): Promise<void> {
    say('This is a test of the emergency bot system! 🚨')
  },
}
export default test
