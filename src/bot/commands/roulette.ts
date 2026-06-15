import type { Command, CommandContext } from '@lib/bot/types.js'
import { config } from 'src/config/env'
import { isTrustedUser } from '../events/utils'

const SHOT_TIMEOUT_DURATION_SECONDS = 60
export default (): Command => ({
    name: 'roulette',
    aliases: [],
    description: 'Play russian roulette! Good luck!',
    async execute({ msg, client }: CommandContext) {
        const { broadcasterId, chatterId, chatterDisplayName } = msg
        const bullet = Math.floor(Math.random() * 6 + 1)

        const isTrusted = isTrustedUser(msg)

        if (bullet === 1) {
            if (isTrusted) {
                client.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    broadcasterId,
                    `The gun fired, but ${chatterDisplayName} caught the bullet!`,
                )
            } else {
                await client.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    broadcasterId,
                    `${chatterDisplayName} was shot!`,
                )

                client.asUser(config.TWITCH_BOT_ID, async ({ moderation }) => {
                    moderation.banUser(broadcasterId, {
                        duration: SHOT_TIMEOUT_DURATION_SECONDS, // 1 minute
                        reason: 'lost the roulette game',
                        user: chatterId,
                    })
                })
            }
        } else {
            client.chat.sendChatMessageAsApp(
                config.TWITCH_BOT_ID!,
                broadcasterId,
                `${chatterDisplayName} was spared!`,
            )
        }
    },
})
