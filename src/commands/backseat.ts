import { Command } from "../types.js"


const backseat: Command = {
    name: 'test',
    aliases: [],
    enabled: true,
    async execute(client, channel, _args, _apiClient) {
        client.say(channel, `please do not backseat the streamer! when @${channel} needs help, they will ask for it! thank you!`)
    }
}

export default backseat