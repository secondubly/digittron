type DeadlockRankTier =
  | 'Obscurus' // Unranked / Calibrating
  | 'Initiate'
  | 'Seeker'
  | 'Acolyte'
  | 'Sentinel'
  | 'Mystic'
  | 'Ritualist'
  | 'Emissary'
  | 'Oracle'
  | 'Phantom'
  | 'Ascendant'
  | 'Eternus';

// 3. Strongly typed object map for the API indices
const DEADLOCK_RANKS_MAP: Record<number, DeadlockRankTier> = {
  0: 'Obscurus',
  1: 'Initiate',
  2: 'Seeker',
  3: 'Acolyte',
  4: 'Sentinel',
  5: 'Mystic',
  6: 'Ritualist',
  7: 'Emissary',
  8: 'Oracle',
  9: 'Phantom',
  10: 'Ascendant',
  11: 'Eternus',
};

interface DeadlockPlayerRank {
  rank: number;       // Corresponds to DEADLOCK_RANKS_MAP key (0-11)
  subrank: number;    // Sub-tier division (1-6), ignored/0 for Obscurus
  last_match: unknown
}

import { command } from '../services/permissions'

export default command('rank', 'everyone', async (_params, ctx) => {
    const response = await fetch(
    `https://api.deadlock-api.com/v1/players/${Bun.env.STEAM_ID ?? '89010416'}/rank`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',

      }
    },
    )

    if (response.ok) {
        const data: DeadlockPlayerRank = await response.json()
        ctx.say(formatDeadlockRank(data))
    } else {
        ctx.say('Rank unavailable.')
    }
})

function formatDeadlockRank(rank: DeadlockPlayerRank): string {
  const tierName = DEADLOCK_RANKS_MAP[rank.rank];
  
  if (!tierName) return 'Unknown';
  if (tierName === 'Obscurus') return tierName; // Obscurus has no sub-ranks

  const romanNumerals: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI'
  };

  return `${tierName} ${romanNumerals[rank.subrank] || rank.subrank}`;
}