import { Command } from "../types.js"
import logger from "../logger.js"


const setGame: Command = {
    name: 'setgame',
    aliases: [],
    enabled: true,
    async execute(client, channel, msg, args, apiClient) {
        if (!apiClient) {
            logger.error(`api client not found, cannot execute ${this.name} command`)
            return
        }
        const { channelId } = msg
        if (!channelId) {
            logger.warn('Channel ID not found, is this possibly a private message?')
            return
        }

        const channelInfo = await apiClient.channels.getChannelInfoById(channelId)
        if (!channelInfo) {
            // log an error
            return
        }

        const { displayName } = msg.userInfo
        client.say(channel, `@${displayName}, current game: ${channelInfo.gameName}`)
    }
}

export default setGame