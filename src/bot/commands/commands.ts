import type { CommandContext, CommandDeps } from '@lib/bot/types'

const commands = ({ getCommands }: CommandDeps) => ({
    name: 'commands',
    aliases: [],
    enabled: true,
    description: 'Lists all available commands',
    async execute({ msg, say }: CommandContext) {
        const { chatterDisplayName } = msg
        const commands = getCommands()

        const commandNames = commands.map((c) => `!${c.name}`).join(', ')
        say(`@${chatterDisplayName} available commands: ${commandNames}`)
    },
})

export default commands
