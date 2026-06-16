import type { Command } from '@lib/bot/types.js'

const test: Command = {
    name: 'test',
    aliases: ['test'],
    description: 'Tests whether the bot is active in the chat or not.',
    execute: async function ({ say }): Promise<void> {
        say('This is a test of the emergency bot system! 🚨')
    },
}
export default test
