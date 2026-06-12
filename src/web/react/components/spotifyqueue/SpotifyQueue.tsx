import useSWR from 'swr'
import classes from './SpotifyQueue.module.css'
import { type QueueResponse, type SimplifiedTrack } from '../../types/spotify'
import { ActionIcon, Box, Flex, Group, Image, ScrollArea, Stack, Text, Title, Divider, Paper } from '@mantine/core'
import { IconMusicPlus } from '@tabler/icons-react'
import { MarqueeText } from '../MarqueeText/MarqueeText'

const getToken = async () => {
  try {
      const twitchId = '89181064'
      const res = await fetch(`/api/spotify/token/${twitchId}`)

      const { accessToken } = await res.json()
      return accessToken
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
          <Box>
            <Flex gap={'xl'} visibleFrom='md'>
              <Group className={classes['now-playing-container']}>  
                  <Image src={data.currently_playing.album.images[0].url} radius='lg' className={classes['now-playing-album']} />                
                  <Stack justify='center' h={'100%'} gap='xs'>
                    <Title order={4} className={classes['now-playing-title']} c={'gray'}>Now Playing</Title>
                    <Title>{data.currently_playing.name}</Title>
                    <Title order={3}>{data.currently_playing.artists[0]?.name}</Title>
                    <Title order={4}>{data.currently_playing.album.name}</Title>
                  </Stack>
              </Group>
              <Box className={classes['queue-container']}>
                <Box pl='md' pb='lg' style={{ 'borderBottom': '1px solid var(--mantine-color-light-dark(dark-3,light.3))'}}>
                  <Title order={4}>Up Next</Title>
                  <Text c={'dark.2'}>{data.queue.length} songs in queue</Text>
                </Box>
                {data.queue.length === 0 ? (
                  <p>Queue is empty.</p>
                ) : (
                <ScrollArea h={'77.5vh'} type='auto' offsetScrollbars my={'md'} overscrollBehavior='contain'>
                  <Box component='ol' className='queue-list'>
                    {data.queue.map((track: SimplifiedTrack, index: number) => (
                        <li key={`${track.id}-${index}`} className={classes['queue-item']}>
                          <Image src={track.album.images[0].url} radius='md' className={classes['queue-album-art']} />
                          <Stack gap='0' className={classes['queue-item-track-info']}>
                            <Text lineClamp={1}>{track.name}</Text>
                            <Text lineClamp={1} c='dark.1'>{track.artists[0]?.name}</Text>
                          </Stack>
                          <Text className={classes['queue-item-duration']}>{formatTime(track.duration_ms)}</Text>
                        </li>
                    ))}
                  </Box>
                </ScrollArea>
                )}
              </Box>
            </Flex>
              
            <Box hiddenFrom='md'>
              <Stack>
                <Box>
                  <Image src={data.currently_playing.album.images[0].url} className={classes['now-playing-album']} w='100%' />
                </Box>
                <Box>
                  <Stack gap={0}>
                    <Group wrap='nowrap' justify='space-between'>
                      <MarqueeText text={data.currently_playing.name} pauseOnHover={false} speed={30} />
                      <ActionIcon bg={'transparent'} size='xl'><IconMusicPlus size='100%' /></ActionIcon>
                    </Group>
                    <Text size='lg'>{data.currently_playing.artists[0]?.name}</Text>
                  </Stack>
                </Box>
              </Stack>
              <Divider my={'lg'} />
              <Stack>
                <Title order={4} fw={'600'}>Up Next</Title>
                <Paper p={'xs'}>
                  <Box component='ul' className='queue-list' p={0} mt={0}>
                    {data.queue.map((track: SimplifiedTrack, index: number) => (
                        <li key={`${track.id}-${index}`} className={classes['queue-item']}>
                          <Image src={track.album.images[0].url} radius='md' className={classes['queue-album-art']} />
                          <Stack gap='0' className={classes['queue-item-track-info']}>
                            <Text lineClamp={1}>{track.name}</Text>
                            <Text lineClamp={1} style={{ color: 'light-dark(#42443F, #CFD1CC)'}}>{track.artists[0]?.name}</Text>
                          </Stack>
                          <Text className={classes['queue-item-duration']} style={{ color: 'light-dark(#42443F, #CFD1CC)'}}>{formatTime(track.duration_ms)}</Text>
                        </li>
                    ))}
                  </Box>
                </Paper>
              </Stack>
            </Box>
          </Box>
  );
}

export default SpotifyQueue