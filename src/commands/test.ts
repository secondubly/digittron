import { ChatClient } from "@twurple/chat"

export default {
    name: 'test',
    aliases: [],
    async execute(client: ChatClient, channel: string) {
        client.say(channel, 'this is a test of the emergency bot system! 🚨')
    }
}