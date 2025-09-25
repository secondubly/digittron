import logger from "../logger.js"
import { Command } from "../types.js"


const roulette: Command = {
    name: 'roulette',
    aliases: [],
    cooldown: 60000, // cooldown in milliseconds
    async execute(client, channel, msg, _args, apiClient) {
        if (!apiClient) {
            logger.error(`api client not found, cannot execute  ${this.name} command`)
            return
        }

        if (!msg.channelId) {
            logger.warn('Channel ID not found, is this possibly a private message?')
            return
        }

        const bullet = Math.floor((Math.random() * 6) + 1)

        const { isMod, isBroadcaster, isSubscriber, displayName, userId } = msg.userInfo

        if (bullet === 1) {
            if (isMod || isBroadcaster || isSubscriber) {
                client.say(channel, `the gun fired, but ${displayName} caught the bullet!`)
            } else {
                client.say(channel, `${displayName} was shot!`)
                apiClient.moderation.banUser(msg.channelId, {
                    duration: 600, // 10 minutes
                    reason: 'lost the roulette game',
                    user: userId
                })
            }
        } else {
            client.say(channel, `${displayName} was spared!`)
        }
    }
}
export default roulette