import { Command } from "../types.js"


const discord: Command = {
    name: 'discord',
    aliases: [],
    async execute(client, channel, _msg, _args, _apiClient) {
        client.say(channel, `join the discord here: ${process.env.DISCORD_URL}`)
    }
}

export default discord