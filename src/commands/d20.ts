import { Command } from "../types.js"

const anniversary: Command = {
    name: 'd20',
    aliases: [],
    async execute(client, channel, msg) {
        const { displayName } = msg.userInfo
        const roll = Math.floor((Math.random() * 20) + 1)
        client.say(channel, `${displayName} rolled a ${roll}${roll === 20 ? '! 🎉' : '.'}`)
    }
}
export default anniversary