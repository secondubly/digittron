// utils/spotify/parseArtist.ts
import type { Static } from '@sinclair/typebox'
import { trackSchema, currentlyPlayingSchema } from 'src/server/schemas/spotify'

// ── Derive types directly from your TypeBox schemas ───────────────────────────

type Track = Static<typeof trackSchema>
type CurrentlyPlaying = Static<typeof currentlyPlayingSchema>

interface ParsedArtist {
    primary: string
    all: string[]
    formatted: string
    count: number
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseArtist(track: Track): ParsedArtist {
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

// ── Format multiple artists naturally ─────────────────────────────────────────

export function formatArtistNames(names: string[]): string {
    if (names.length === 0) return 'Unknown Artist'
    if (names.length === 1) return names[0]
    if (names.length === 2) return `${names[0]} & ${names[1]}`

    const allButLast = names.slice(0, -1).join(', ')
    const last = names[names.length - 1]
    return `${allButLast} & ${last}`
}

// ── Clean artist name artifacts ───────────────────────────────────────────────

export function cleanArtistName(name: string): string {
    return name
        .trim()
        .replace(
            /\s*[\(\[](feat|ft|featuring|with|vs\.?|x)\.?\s+[^\)\]]+[\)\]]/gi,
            '',
        )
        .replace(/[,;&]+$/, '')
        .trim()
}

// ── Clean track name ──────────────────────────────────────────────────────────

export function cleanTrackName(name: string): string {
    return name
        .trim()
        .replace(
            /\s*[\(\[]\d{0,4}\s*(remaster(ed)?|re-master(ed)?|version|edit|mix|demo|live|acoustic|radio\s*edit|single\s*version)[^\)\]]*[\)\]]/gi,
            '',
        )
        .replace(/\s*[\(\[](feat|ft|featuring)\.?\s+[^\)\]]+[\)\]]/gi, '')
        .trim()
}

// ── Get album art — largest image first ───────────────────────────────────────

export function getAlbumArt(track: Track): string | null {
    if (!track.album.images.length) return null

    return (
        [...track.album.images].sort((a, b) => b.width - a.width).at(0)?.url ??
        null
    )
}

// ── Format full track for chat ────────────────────────────────────────────────

export function formatTrackForChat(track: Track): string {
    const { formatted } = parseArtist(track)
    const trackName = cleanTrackName(track.name)
    return `${trackName} by ${formatted}`
}

// ── Parse full currently playing response ─────────────────────────────────────

export function parseCurrentlyPlaying(data: CurrentlyPlaying) {
    const { item, is_playing } = data
    const artist = parseArtist(item)
    const trackName = cleanTrackName(item.name)
    const albumArt = getAlbumArt(item)

    return {
        isPlaying: is_playing,
        trackName,
        albumName: item.album.name,
        albumArt,
        artist,
        uri: item.uri,
        chatMessage: `${trackName} by ${artist.formatted}`,
    }
}
