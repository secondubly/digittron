import useSWR from 'swr'
import classes from './SpotifyQueue.module.css'
import { type QueueResponse, type SimplifiedTrack } from '../../types/spotify'
import { Box, Flex, Grid, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'

const getToken = async () => {
  try {
      const twitchId = '89181064'
      const res = await fetch(`/api/spotify/token/${twitchId}`)

      const token = await res.text()
      return token
  } catch (error) {
      console.error('Failed to retrieve token', error)
  }
}

const spotifyFetcher = async (url: string) => {
  try {
    const token = await getToken()
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
      if (res.status === 401) {
        const newToken = await getToken()

        const retryResponse = await fetch(url, {
          headers: {
              Authorization: `Bearer ${newToken}`,
          },
        })

        if (!retryResponse.ok) {
          throw new Error(retryResponse.statusText)
        }

        return retryResponse.json()
      }
      throw new Error(res.statusText)
    }

    return res.json()
  } catch (err) {
    throw err
  }
}


const formatTime = (ms: number) => {
  return new Date(ms).toISOString().slice(14, 19)
}

const SpotifyQueue = () => {
  // SWR constructor: (url endpoint (aka key), fetch HTTP request to call on the endpoint, {optional parameters})
  const { data, error, isLoading } = useSWR<QueueResponse>('https://api.spotify.com/v1/me/player/queue', spotifyFetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
    }
  );

  if (isLoading) return <div>Loading player queue...</div>;
  if (error) return <div>Failed to load queue. Ensure Spotify is active.</div>;
  if (!data || (data.currently_playing === null && !data.queue.length)) return <div>No active device or music playing.</div>;

  return (
    <Grid>
      <Grid.Col span={9}>
          {data.currently_playing && (
            <SimpleGrid cols={2} py='lg' className={classes['spotify-container']}>
              <Box>
                <Image src={data.currently_playing.album.images[0].url} radius='lg' className={classes['now-playing-album']} />                
              </Box>
              <Box>
                  <Stack justify='center' h={'100%'} gap='xs'>
                    <Title order={4} className={classes['now-playing-title']} c={'gray'}>Now Playing</Title>
                    <Title>{data.currently_playing.name}</Title>
                    <Title order={3}>{data.currently_playing.artists[0]?.name}</Title>
                    <Title order={4}>{data.currently_playing.album.name}</Title>
                  </Stack>
              </Box>
            </SimpleGrid>
          )}
      </Grid.Col>
      <Grid.Col span={3}>
        <Title order={4}>Up Next</Title>
          {data.queue.length === 0 ? (
            <p>Queue is empty.</p>
          ) : (
          <ol>
            {data.queue.map((track: SimplifiedTrack, index: number) => (
                <li key={`${track.id}-${index}`} className={classes['queue-item']}>
                  <Group justify='center' className={classes['queue-item-container']}>
                  <Image src={track.album.images[0].url} radius='lg' className={classes['queue-album-art']} />
                  <Stack justify='center' gap='0' className={classes['queue-item-track-info']}>
                    <Text truncate='end' flex={1}>{track.name}</Text>
                    <Text truncate='end' flex={1}>{track.artists[0]?.name}</Text>
                  </Stack>
                  <Text>{formatTime(track.duration_ms)}</Text>
                  </Group>
                </li>
            ))}
          </ol>)}
      </Grid.Col>
    </Grid>
  );
}

export default SpotifyQueue