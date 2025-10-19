import { Command } from '../types.js'

const anniversary: Command = {
    name: 'd20',
    aliases: [],
    enabled: true,
    async execute(client, channel, msg) {
        const { displayName } = msg.userInfo
        const roll = Math.floor(Math.random() * 20 + 1)
        client.say(
            channel,
            `${displayName} rolled a ${roll}${roll === 20 ? '! 🎉' : '.'}`,
        )
        // TODO: if user rolled a 1, timeout for 1 minute
    },
}
export default anniversary
