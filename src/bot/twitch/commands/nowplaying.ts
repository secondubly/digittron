import { command } from '../permissions'
import type { SpotifyCurrentlyPlayingResponse, SpotifyTrackItem } from '../types'

export default command(
  'nowplaying',
  'mod',
  async (_params, ctx) => {
    const chatterDisplayName = ctx.userDisplayName

    const res: Response = await fetch(
      `http://localhost:${Bun.env.WEB_PORT ?? '3000'}/api/spotify/now-playing`,
      {
        method: 'GET',
      },
    ) as Response

    if (!res.ok) {
      return
    } else if (res.status === 204) {
      ctx.say(`@${chatterDisplayName} Nothing is playing right now.`)
      return
    } else {
      const data = await res.json()
      const msg = parseNowPlaying(data)

      ctx.say(`@${chatterDisplayName} ${msg}`)
      return
    }

    // const { isPlaying, albumName } = result
    // const status = isPlaying ? '🎵' : '⏸️'
  },
  {
    aliases: ['np'],
  },
)

function cleanArtistName(name: string): string {
  return name
    .trim()
    .replace(/\s*[\(\[](feat|ft|featuring|with|vs\.?|x)\.?\s+[^\)\]]+[\)\]]/gi, '')
    .replace(/[,;&]+$/, '')
    .trim()
}

function formatArtistNames(names: string[]): string {
  switch (names.length) {
    case 0:
      return 'Unknown Artist'
    case 1:
      return names[0]
    case 2:
      return `${names[0]} & ${names[1]}`
  }

  const allButLast = names.slice(0, -1).join(', ')
  const last = names[names.length - 1]
  return `${allButLast} & ${last}`
}

function cleanTrackName(name: string): string {
  return name
    .trim()
    .replace(
      /\s*[\(\[]\d{0,4}\s*(remaster(ed)?|re-master(ed)?|version|edit|mix|demo|live|acoustic|radio\s*edit|single\s*version)[^\)\]]*[\)\]]/gi,
      '',
    )
    .replace(/\s*[\(\[](feat|ft|featuring)\.?\s+[^\)\]]+[\)\]]/gi, '')
    .trim()
}

function parseArtist(track: SpotifyTrackItem) {
  const artists = track.artists ?? []

  if (artists.length === 0) {
    return {
      primary: 'Unknown Artist',
      all: [],
      formatted: 'Unknown Artist',
      count: 0,
    }
  }

  const names = artists.map((a) => cleanArtistName(a.name))
  const primary = names[0]

  return {
    primary,
    all: names,
    formatted: formatArtistNames(names),
    count: names.length,
  }
}

function parseNowPlaying(data: SpotifyCurrentlyPlayingResponse): string {
  const item = data.item as SpotifyTrackItem
  if (item?.type !== 'track' || !item.name) return 'Nothing is playing on Spotify right now.'

  const artist = parseArtist(item)
  const trackName = cleanTrackName(item.name)
  const status = data.is_playing ? '🎵' : '⏸️'
  return `${status} ${trackName} by ${artist.formatted} - ${item.album.name}`
}