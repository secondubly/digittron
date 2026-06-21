import useSWR from 'swr'
import { spotifyFetcher } from '../lib/spotifyFetcher'
export const usePlayback = () => {
    // SWR constructor: (url endpoint (aka key), fetch HTTP request to call on the endpoint, {optional parameters})
    const { data, error, mutate } = useSWR('/me/player', spotifyFetcher, {
        // refresh every 2 seconds if a song is playing; otherwise, refresh immediately
        refreshInterval: (data) => (data?.currently_playing ? 2000 : 0),
        dedupingInterval: 1000,
        revalidateOnFocus: false,
    })

    return {
        playback: data,
        isLoading: !data && !error,
        error,
        mutate,
    }
}

export const useQueue = () => {
    const { data, error, mutate } = useSWR('/me/player/queue', spotifyFetcher, {
        refreshInterval: 10000,
        revalidateOnFocus: false,
    })

    return {
        queue: data?.queue ?? [],
        isLoading: !data && !error,
        error,
        mutate,
    }
}
