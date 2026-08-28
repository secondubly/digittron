import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import type { CommandContext, CommandDeps } from '../types'
import type { commandBody } from '@root/src/server/schemas/commands'
import { config } from '@core/config/env'

interface CommandFlags {
  userLevel: string | null
  cooldown: number | null
  alias: string | null
}

interface ParsedNewCommand {
  action: string
  newCommand: string
  flags: CommandFlags
  response: string
}

const isMod = (msg: EventSubChannelChatMessageEvent): boolean => {
  // broadcaster is considered a mod in almost all cases
  return (
    msg.chatterId === msg.broadcasterId || Object.keys(msg.badges).some((b) => b === 'moderator')
  )
}

const commands = ({ getCommands }: CommandDeps) => ({
  name: 'commands',
  aliases: [],
  enabled: true,
  description: 'Lists all available commands',
  async execute({ msg, say, args }: CommandContext) {
    const { chatterDisplayName, chatterId, broadcasterId, broadcasterName } = msg
    const commands = getCommands()
    if (args.length !== 0) {
      if (!isMod(msg)) return
      else if (args.length < 3) {
        say(
          `@${chatterDisplayName} incorrect format: !commands [add|delete] !command_name "command response"`,
        )
        return
      }

      const command = commandParser(args)

      if (commands.findIndex((c) => c.name === command.newCommand) !== -1) {
        say(`@${chatterDisplayName} a command already exists with that name."`)
        return
      }

      const commandBody = {
        command_name: command.newCommand,
        response: command.response,
        created_by: chatterId,
        channel_id: broadcasterId,
        channel_name: broadcasterName,
      } as commandBody

      switch (command.action) {
        case 'add':
          // TODO: store command in DB and add to command registry
          addCommand(commandBody)
          break
        case 'delete':
          break
        case 'edit':
          break
        default:
          say(
            `@${chatterDisplayName} incorrect format: !commands [add|delete] !command_name "command response"`,
          )
          break
      }
    } else {
      // only show enabled commands
      const commandNames = commands
        .filter((c) => c.enabled)
        .map((c) => `!${c.name}`)
        .join(', ')
      say(`@${chatterDisplayName} available commands: ${commandNames}`)
    }
  },
})

async function addCommand(command: commandBody) {
  const result = await fetch(`${config.CLIENT_URL}/api/commands/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })

  return result.status
}

function commandParser(args: string[]): ParsedNewCommand {
  const subcommand = args[0]
  const newCommand = args[1]

  const payload = args.slice(2)

  const flags: CommandFlags = {
    userLevel: null,
    cooldown: null,
    alias: null,
  }

  const responseWords = []

  for (const word of payload) {
    if (word.startsWith('-ul=')) {
      flags.userLevel = word.split('=')[1]
    } else if (word.startsWith('-cd=')) {
      const cdValue = parseInt(word.split('=')[1], 10)
      flags.cooldown = isNaN(cdValue) ? null : cdValue // Convert cooldown string to number safely
    } else if (word.startsWith('-a=')) {
      flags.alias = word.split('=')[1] || null
    } else {
      responseWords.push(word)
    }
  }

  let response = responseWords.join(' ')

  // if response is wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(response)) {
    response = response.slice(1, -1)
  }

  return {
    action: subcommand,
    newCommand,
    flags: flags,
    response: response,
  }
}

export default commands
