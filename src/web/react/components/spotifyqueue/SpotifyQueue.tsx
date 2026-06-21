import classes from './SpotifyQueue.module.css'
import { type SimplifiedTrack } from '../../types/spotify'
import { ActionIcon, Box, Flex, Group, Image, ScrollArea, Stack, Text, Title, Divider, Paper, Center, Loader } from '@mantine/core'
import { IconMusicPlus } from '@tabler/icons-react'
import { MarqueeText } from '../MarqueeText/MarqueeText'
import { usePlayback, useQueue } from '../../hooks/useSpotify'


const formatTime = (ms: number) => {
  return new Date(ms).toISOString().slice(14, 19)
}

const SpotifyQueue = () => {
  const { playback: data, isLoading, error } = usePlayback()
  const { queue } = useQueue()

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="sm" />
      </Center>
    )
  }
  if (error) return <div>Failed to load queue. Ensure Spotify is active.</div>;

  if (!data || (data.currently_playing === null && !queue.length)) {
    return (
      <Center h={200}>
        <Stack align="center" gap="xs">
          <Text fw={500}>No active playback</Text>
          <Text size="sm" c="dimmed">
            Open Spotify on any device to get started
          </Text>
        </Stack>
      </Center>
    )
  }

  const track = data?.item
  
  return (
          <Box>
            <Flex gap={'10em'} visibleFrom='md'>
              <Group className={classes['now-playing-container']}>  
                  <Image src={track.album.images[0].url} radius='lg' className={classes['now-playing-album']} />                
                  <Stack justify='center' h={'100%'} gap='xs'>
                    <Title order={4} className={classes['now-playing-title']} c={'gray'}>Now Playing</Title>
                    <Title>{track.name}</Title>
                    <Title order={3}>{track.artists[0]?.name}</Title>
                    <Title order={4}>{track.album.name}</Title>
                  </Stack>
              </Group>
              <Box className={classes['queue-container']}>
                <Box pl='md' pb='lg' style={{ 'borderBottom': '1px solid var(--mantine-color-light-dark(dark-3,light.3))'}}>
                  <Title order={4}>Up Next</Title>
                  <Text c={'dark.2'}>{queue.length} songs in queue</Text>
                </Box>
                {queue.length === 0 ? (
                  <p>Queue is empty.</p>
                ) : (
                <ScrollArea h={'77.5vh'} type='auto' offsetScrollbars my={'md'} overscrollBehavior='contain'>
                  <Box component='ol' className='queue-list'>
                    {queue.map((track: SimplifiedTrack, index: number) => (
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
                  <Image src={track.album.images[0].url} className={classes['now-playing-album']} w='100%' />
                </Box>
                <Box>
                  <Stack gap={0}>
                    <Group wrap='nowrap' justify='space-between'>
                      <MarqueeText text={track.name} pauseOnHover={false} speed={30} />
                      <ActionIcon bg={'transparent'} size='xl'><IconMusicPlus size='100%' /></ActionIcon>
                    </Group>
                    <Text size='lg'>{track.artists[0]?.name}</Text>
                  </Stack>
                </Box>
              </Stack>
              <Divider my={'lg'} />
              <Stack>
                <Title order={4} fw={'600'}>Up Next</Title>
                <Paper p={'xs'}>
                  <Box component='ul' className='queue-list' p={0} mt={0}>
                    {queue.map((track: SimplifiedTrack, index: number) => (
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