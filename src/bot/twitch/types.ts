// Spotify

export interface SpotifyToken {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: 'Bearer'
}

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyArtist {
  name: string
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  type: 'artist'
  uri: string
}

export interface SpotifyAlbum {
  album_type: string
  total_tracks: number
  available_markets: string[]
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  release_date: string
  release_date_precision: string
  type: 'album'
  uri: string
  artists: SpotifyArtist[]
}

export interface SpotifyTrackItem {
  album: SpotifyAlbum
  artists: SpotifyArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: {
    isrc?: string
    ean?: string
    upc?: string
  }
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
}

export interface SpotifyEpisodeItem {
  audio_preview_url: string | null
  description: string
  duration_ms: number
  explicit: boolean
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  images: SpotifyImage[]
  is_externally_hosted: boolean
  is_playable: boolean
  language: string
  languages: string[]
  name: string
  release_date: string
  release_date_precision: string
  resume_point?: {
    fully_played: boolean
    resume_position_ms: number
  }
  type: 'episode'
  uri: string
}

export interface SpotifyCurrentlyPlayingResponse {
  context: {
    type: 'artist' | 'playlist' | 'album' | 'show'
    href: string
    external_urls: {
      spotify: string
    }
    uri: string
  } | null
  timestamp: number
  progress_ms: number | null
  is_playing: boolean
  item: SpotifyTrackItem | SpotifyEpisodeItem | null
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
  actions?: {
    disallows: {
      [key: string]: boolean
    }
  }
}
