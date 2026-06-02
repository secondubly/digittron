import useSWR from 'swr'
import { type QueueResponse, type SimplifiedTrack } from '../../types/spotify'

const spotifyFetcher = async (url: string, token: string, ) => {
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }

    return res.json()
}


const SpotifyQueue = ({ accessToken }: { accessToken: string | null }) => {
  // SWR constructor: (url endpoint (aka key), fetch HTTP request to call on the endpoint (aka key), {optional parameters})
  useSWR(accessToken, )
  const { data, error, isLoading } = useSWR<QueueResponse>(
    accessToken ? ['https://api.spotify.com/v1/me/player/queue', accessToken] : null,
    ([url, token]: string[]) => spotifyFetcher(url, token),
    {
      refreshInterval: 5000, // Polls every 5 seconds to stay in sync with Spotify
      revalidateOnFocus: false,
    }
  );

  if (isLoading) return <div>Loading player queue...</div>;
  if (error) return <div>Failed to load queue. Ensure Spotify is active.</div>;
  if (!data || (data.currently_playing === null && !data.queue.length)) return <div>No active device or music playing.</div>;

  return (
    <div className="spotify-player-container">
      {/* Currently Playing Track */}
      {data.currently_playing && (
        <div className="currently-playing">
          <h3>Now Playing:</h3>
          <p>{data.currently_playing.name} - {data.currently_playing.artists[0]?.name}</p>
        </div>
      )}

      {/* Up Next / Queue */}
      <div className="queue-list">
        <h3>Up Next:</h3>
        {data.queue.length === 0 ? (
          <p>Queue is empty.</p>
        ) : (
          <ul>
            {data.queue.map((track: SimplifiedTrack, index: number) => (
              <li key={`${track.id}-${index}`}>
                <strong>{index + 1}.</strong> {track.name} by {track.artists[0]?.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SpotifyQueue