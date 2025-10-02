import { ChatClient } from "@twurple/chat"
import { Command } from "../types.js"


const wishlist: Command = {
    name: 'wishlist',
    aliases: [],
    enabled: true,
    async execute(client, channel, _args, _apiClient) {
        client.say(channel, 'throne: https://throne.com/secondubly | steam: https://store.steampowered.com/wishlist/id/secondubly')
    }
}

export default wishlist