export interface SimplifiedTrack {
  id: string
  name: string
  duration_ms: number
  uri: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
}

export interface QueueResponse {
  currently_playing: SimplifiedTrack
  queue: SimplifiedTrack[]
}
