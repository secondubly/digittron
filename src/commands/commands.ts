import { Command } from "../types.js"
import logger from "../logger.js"


const commands: Command = {
    name: 'commands',
    aliases: [],
    enabled: true,
    async execute(client, channel, msg, args, _apiClient) {
        const commands = args.slice(0, -1).join(', ')
        const { displayName } = msg.userInfo
        client.say(channel, `@${displayName} available commands: ${commands}`)
    }
}

export default commands