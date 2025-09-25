import { ChatClient } from "@twurple/chat"
import { Command } from "../types.js"


const test: Command = {
    name: 'test',
    aliases: [],
    async execute(client, channel, _args, _apiClient) {
        client.say(channel, 'this is a test of the emergency bot system! 🚨')
    }
}

export default test