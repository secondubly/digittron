import type { CommandContext, CommandDeps } from '@lib/bot/types'
import type { TokenStore } from '@lib/core/tokens/TokenStore'
import { log } from '@lib/services/logger'
import { config } from 'src/config/env'

export interface MMRHistory {
    account_id: number
    match_id: number
    start_time: number
    player_score: number
    rank: number
    division: number
    division_tier: number
}

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
    async execute({ msg, say }: CommandContext) {
        if (!config.STEAM_ID) {
            log.bot.warn(
                `${msg.chatterName} tried to execute !${this.name} but steam id is not configured.`,
            )
            return
        }

        const deadlockData = await getDeadlockRank(config.STEAM_ID, tokenStore)

        if (!deadlockData) {
            say('No rank found!')
            return
        }

        tokenStore.set(`deadlock:${config.STEAM_ID}`, deadlockData)
        const { division, division_tier } = deadlockData
        const namedRank = DEADLOCK_RANKS.get(division)
        say(`Rank: ${namedRank} (Division: ${division_tier})`)
    },
})

async function getDeadlockRank(
    steamId: string,
    tokenStore: TokenStore,
): Promise<MMRHistory | null> {
    const response = await fetch(
        `https://api.deadlock-api.com/v1/players/mmr?account_ids=${steamId}`,
        {
            method: 'GET',
        },
    )

    let rank: MMRHistory | null
    if (!response.ok) {
        if (response.status === 500) {
            // use cached value
            rank = (await tokenStore.get(
                `deadlock:${steamId}`,
            )) as unknown as MMRHistory
            if (!rank) return null
        } else {
            // any other error just return null
            return null
        }
    } else {
        const data: MMRHistory[] = await response.json()
        const firstResult = data[0]

        rank = firstResult
    }

    return rank
}

export default rank
