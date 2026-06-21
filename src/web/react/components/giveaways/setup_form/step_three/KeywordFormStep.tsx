import type { UseFormReturnType } from '@mantine/form'
import {
  Box,
  Paper,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { LuckSettings } from './LuckSettings'
import { useState } from 'react'
import type { GiveawayFormValues } from '../../../../lib/types'

export const KeywordFormStep: React.FC<{
  form: UseFormReturnType<GiveawayFormValues>
}> = ({ form }) => {
  const [removeSpammers, setRemoveSpammers] = useState(false)
  const [announceWinner, setAnnounceWinner] = useState(false)
  const [uniqueWinners, setUniquerWinners] = useState(true)
  return (
    <Stack>
      <Paper
        p="md"
        radius="sm"
        display={'flex'}
        style={{ flexDirection: 'column' }}
      >
        <Box>
          <Title order={5} style={{ fontWeight: 'bolder' }}>
            Keyword
          </Title>
          <Text size="sm" mb={'sm'}>
            The phrase users must type to enter the giveaway
          </Text>
        </Box>
        <Box>
          <TextInput
            placeholder="!join"
            name="keyword"
            {...form.getInputProps('keyword')}
          />
        </Box>
      </Paper>
      <Paper
        p="md"
        radius="sm"
        display="flex"
        style={{ flexDirection: 'column' }}
      >
        <Box>
          <Title order={5} style={{ fontWeight: 'bolder' }}>
            Remove Spammers
          </Title>
          <Text size="sm" mb={'sm'}>
            Remove chatters who post the message more than once
          </Text>
        </Box>
        <Switch
          withThumbIndicator
          checked={removeSpammers}
          style={{ alignSelf: 'flex-end' }}
          onChange={() => setRemoveSpammers(!uniqueWinners)}
        />
      </Paper>
      <Paper
        p="md"
        radius="sm"
        display="flex"
        style={{ flexDirection: 'column' }}
      >
        <Box>
          <Title order={5} style={{ fontWeight: 'bolder' }}>
            Unique Winners
          </Title>
          <Text size="sm" mb={'sm'}>
            Whether giveaway winners are removed from the pool after winning
          </Text>
        </Box>
        <Switch
          withThumbIndicator
          checked={uniqueWinners}
          style={{ alignSelf: 'flex-end' }}
          onChange={() => setUniquerWinners(!uniqueWinners)}
        />
      </Paper>
      <Paper
        p="md"
        radius="sm"
        display="flex"
        style={{ flexDirection: 'column' }}
      >
        <Box>
          <Title order={5} style={{ fontWeight: 'bolder' }}>
            Chat Announcement
          </Title>
          <Text size="sm" mb={'sm'}>
            Announce winners in chat
          </Text>
        </Box>
        <Switch
          withThumbIndicator
          checked={announceWinner}
          style={{ alignSelf: 'flex-end' }}
          onChange={() => setAnnounceWinner(!announceWinner)}
        />
      </Paper>
      <LuckSettings participants={form.getValues().participants || []} />
    </Stack>
  )
}
