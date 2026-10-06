const FALLBACK_COLORS = [
  '#ff6b6b',
  '#ffa94d',
  '#ffd43b',
  '#69db7c',
  '#38d9a9',
  '#4dabf7',
  '#9775fa',
  '#f783ac',
]

// Same name -> same color, for users who haven't picked one on Twitch
export function fallbackColor(name: string): string {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length] ?? '#ffffff'
}
