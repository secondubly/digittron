import { Command } from '../types.js'
import logger from '../logger.js'

const title: Command = {
    name: 'title',
    aliases: [],
    enabled: true,
    async execute(client, channel, msg, args, apiClient) {
        if (!apiClient) {
            logger.error(
                `api client not found, cannot execute  ${this.name} command`,
            )
            return
        }

        const { channelId } = msg
        if (!channelId) {
            logger.warn(
                'Channel ID not found, is this possibly a private message?',
            )
            return
        }

        const channelInfo =
            await apiClient.channels.getChannelInfoById(channelId)
        if (!channelInfo) {
            return
        }

        const { displayName } = msg.userInfo
        if (!args.length) {
            client.say(channel, `@${displayName}, title: ${channelInfo.title}`)
        } else {
            const { isMod, isBroadcaster } = msg.userInfo
            if (!isMod && !isBroadcaster) {
                return
            }

            const streamTitle = args.join()

            apiClient.channels.updateChannelInfo(channelId, {
                title: streamTitle,
            })

            client.say(
                channel,
                `@${displayName} updated game title to: ${streamTitle}.`,
            )
        }
    },
}

export default title
