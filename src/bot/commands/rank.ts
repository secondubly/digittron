import type { Command, MMRHistory } from '@lib/bot/types.js'
import redisClient from '@lib/utils/redis'

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

const rank: Command = {
    name: 'rank',
    aliases: [],
    enabled: false,
    async execute(event, _args, apiClient) {
        const account_id = process.env.STEAM_ID || '89010416'
        const response = await fetch(
            `https://api.deadlock-api.com/v1/players/mmr?account_ids=${account_id}`,
            {
                method: 'GET',
            },
        )

        if (!response.ok) {
            if (response.status === 500) {
                // use cached value
                const rank = redisClient.get(`deadlock_${account_id}`)
                if (!rank) {
                    apiClient.chat.sendChatMessageAsApp(
                        process.env.BOT_ID!,
                        event.broadcasterId,
                        'No rank found!',
                    )
                    return
                }

                apiClient.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    event.broadcasterId,
                    `Rank: ${rank}`,
                )
                return
            } else {
                apiClient.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    event.broadcasterId,
                    `Invalid user provided.`,
                )
                return
            }
        } else {
            const data: MMRHistory[] = await response.json()
            const firstResult = data[0]
            const rank = DEADLOCK_RANKS.get(firstResult.division)
            if (!rank) {
                apiClient.chat.sendChatMessageAsApp(
                    process.env.BOT_ID!,
                    event.broadcasterId,
                    'No rank found!',
                )
                return
            }

            apiClient.chat.sendChatMessageAsApp(
                process.env.BOT_ID!,
                event.broadcasterId,
                `Rank: ${rank} ${firstResult.division_tier}`,
            )
            return
        }
    },
}

export default rank
