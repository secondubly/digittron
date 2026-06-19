import type { Command, CommandContext } from '../types.js'
import { config } from '@core/config/env'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'

const SHOT_TIMEOUT_DURATION_SECONDS = 60
export default (): Command => ({
    name: 'roulette',
    aliases: [],
    description: 'Play russian roulette! Good luck!',
    async execute({ msg, client, say }: CommandContext) {
        const { broadcasterId, chatterId, chatterDisplayName } = msg
        const bullet = Math.floor(Math.random() * 6 + 1)

        const isTrusted = isTrustedUser(msg)

        if (bullet === 1) {
            if (isTrusted) {
                say(
                    `The gun fired, but ${chatterDisplayName} caught the bullet!`,
                )
            } else {
                say(`${chatterDisplayName} was shot!`)

                client.asUser(config.TWITCH_BOT_ID, async ({ moderation }) => {
                    moderation.banUser(broadcasterId, {
                        duration: SHOT_TIMEOUT_DURATION_SECONDS, // 1 minute
                        reason: 'lost the roulette game',
                        user: chatterId,
                    })
                })
            }
        } else {
            say(`${chatterDisplayName} was spared!`)
        }
    },
})

export const isTrustedUser = (event: EventSubChannelChatMessageEvent) => {
    const { chatterId, broadcasterId } = event

    if (chatterId === broadcasterId) return true

    return Object.keys(event.badges).some(
        (b) => b === 'moderator' || b === 'subscriber',
    )
}
