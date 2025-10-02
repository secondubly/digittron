import { Command } from "../types.js"


const subgoal: Command = {
    name: 'subgoal',
    aliases: [],
    enabled: true,
    async execute(client, channel, _args, _apiClient) {
        client.say(channel, 'all sub goals can be found here: https://microbin.secondubly.tv/upload/eel-snail-bee')
    }
}

export default subgoal