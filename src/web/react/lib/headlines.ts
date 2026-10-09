type Tags = Record<string, string>

const PLANS: Record<string, string> = { Prime: 'Prime', '1000': 'Tier 1', '2000': 'Tier 2', '3000': 'Tier 3' }

export function cheerHeadline(tags: Tags): string | null {
  const bits = Number(tags['bits'] ?? 0)
  if (!bits) return null
  return `cheered ${bits.toLocaleString()} bit${bits === 1 ? '' : 's'}`
}

export function subHeadline(tags: Tags): string | null {
  const kind = tags['msg-id']
  if (kind !== 'sub' && kind !== 'resub') return null

  const plan = PLANS[tags['msg-param-sub-plan'] ?? '']
  const withPlan = plan ? ` with ${plan}` : ''
  if (kind === 'sub') return `subscribed${withPlan}`

  const months = Number(tags['msg-param-cumulative-months'] ?? 0)
  const streak = Number(tags['msg-param-streak-months'] ?? 0)
  const forMonths = months > 1 ? ` for ${months} months` : ''
  const shareStreak = tags['msg-param-should-share-streak'] === '1' && streak > 1 // only used if user chooses to share streak
  return `resubscribed${withPlan}${forMonths}${shareStreak ? ` (${streak} month streak)` : ''}`
}