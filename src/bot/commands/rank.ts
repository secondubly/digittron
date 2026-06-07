import type { CommandContext, CommandDeps } from '@lib/bot/types'
import type { MMRHistory } from '@lib/types.js'
import { config } from 'src/config'

const DEADLOCK_RANKS = new Map<number, string>([
    [0, 'Obscurus'],
    [1, 'Initiate'],
    [2, 'Seeker'],
    [3, 'Alchemist'],
    [4, 'Arcanist'],
    [5, 'Ritualist'],
    [6, 'Emissary'],
    [7, 'Archon'],
    [8, 'Oracle'],
    [9, 'Phantom'],
    [10, 'Ascendant'],
    [11, 'Eternus'],
])

const rank = ({ tokenStore }: CommandDeps) => ({
    name: 'rank',
    aliases: [],
    description: 'Show Daedlock rank',
    async execute({ msg, client }: CommandContext) {
        const { broadcasterId } = msg
        const response = await fetch(
            `https://api.deadlock-api.com/v1/players/mmr?account_ids=${config.STEAM_ID}`,
            {
                method: 'GET',
            },
        )

        if (!response.ok) {
            if (response.status === 500) {
                // use cached value
                const rank = tokenStore.get(`deadlock:${config.STEAM_ID}`)
                if (!rank) {
                    client.chat.sendChatMessageAsApp(
                        config.TWITCH_BOT_ID,
                        broadcasterId,
                        'No rank found!',
                    )
                    return
                }

                client.chat.sendChatMessageAsApp(
                    config.TWITCH_BOT_ID,
                    broadcasterId,
                    `Rank: ${rank}`,
                )
                return
            } else {
                client.chat.sendChatMessageAsApp(
                    config.TWITCH_BOT_ID,
                    broadcasterId,
                    `Invalid user provided.`,
                )
                return
            }
        } else {
            const data: MMRHistory[] = await response.json()
            const firstResult = data[0]
            const rank = DEADLOCK_RANKS.get(firstResult.division)
            if (!rank) {
                client.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    broadcasterId,
                    'No rank found!',
                )
                return
            }

            client.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                broadcasterId,
                `Rank: ${rank} ${firstResult.division_tier}`,
            )
            return
        }
    },
})

export default rank
