import { emoteProviders } from '../config'
import type { Part } from '../types'

// Twitch emote ranges are in Unicode code points, so split with Array.from
export function buildParts(text: string, emotesTag: string): Part[] {
  if (!emotesTag) return [text]
  const chars = Array.from(text)
  const ranges: [number, number, string][] = []
  for (const group of emotesTag.split('/')) {
    const [id, positions] = group.split(':')
    if (!id || !positions) continue
    for (const range of positions.split(',')) {
      const [s, e] = range.split('-').map(Number)
      if (s === undefined || e === undefined) continue
      ranges.push([s, e, id])
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const parts: Part[] = []
  let cur = 0
  for (const [s, e, id] of ranges) {
    if (s > cur) parts.push(chars.slice(cur, s).join(''))
    parts.push({
      src: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`,
      alt: chars.slice(s, e + 1).join(''),
    })
    cur = e + 1
  }
  if (cur < chars.length) parts.push(chars.slice(cur).join(''))
  return parts
}

// Third-party emotes (7TV / BTTV): word -> image URL. Later sets override earlier ones.
const thirdParty = new Map<string, string>()
let loadedRoom = ''

const getJson = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.json()
}
const bttvUrl = (id: string) => `https://cdn.betterttv.net/emote/${id}/2x.webp`
const stvUrl = (id: string) => `https://cdn.7tv.app/emote/${id}/2x.webp`
type Pair = [word: string, url: string]

export async function loadThirdParty(roomId: string) {
  if (!roomId || roomId === loadedRoom) return
  loadedRoom = roomId

  const jobs: Promise<Pair[]>[] = []
  if (emoteProviders.has('bttv')) {
    jobs.push(
      getJson('https://api.betterttv.net/3/cached/emotes/global').then((list: any[]) =>
        list.map((e): Pair => [e.code, bttvUrl(e.id)]),
      ),
      getJson(`https://api.betterttv.net/3/cached/users/twitch/${roomId}`).then((u: any) =>
        [...(u.channelEmotes ?? []), ...(u.sharedEmotes ?? [])].map((e): Pair => [
          e.code,
          bttvUrl(e.id),
        ]),
      ),
    )
  }
  if (emoteProviders.has('7tv')) {
    jobs.push(
      getJson('https://7tv.io/v3/emote-sets/global').then((s: any) =>
        (s.emotes ?? []).map((e: any): Pair => [e.name, stvUrl(e.id)]),
      ),
      getJson(`https://7tv.io/v3/users/twitch/${roomId}`).then((u: any) =>
        (u.emote_set?.emotes ?? []).map((e: any): Pair => [e.name, stvUrl(e.id)]),
      ),
    )
  }

  // One failing provider shouldn't break the others
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === 'fulfilled') for (const [word, url] of r.value) thirdParty.set(word, url)
    else console.warn('Emote list failed to load:', r.reason)
  }
}

// Swap whole words that match a 7TV/BTTV emote name for an image
export function expandThirdParty(parts: Part[]): Part[] {
  if (!thirdParty.size) return parts
  return parts.flatMap((p) =>
    typeof p !== 'string'
      ? [p]
      : p.split(/(\s+)/).map((tok): Part => {
          const src = thirdParty.get(tok)
          return src ? { src, alt: tok } : tok
        }),
  )
}
