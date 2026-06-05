import { Text, Container, Box, Title, SimpleGrid } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { ModerationPanelCard } from '../components/ModerationPanelCard';
import { IconCancel, IconCodeAsterisk, IconLetterD, IconLinkFilled, IconMoodSmile, IconRepeat } from '@tabler/icons-react';
import { WebSocket } from 'node:http';

const ChatModeration: React.FC = () => {

  const wsRef = useRef<WebSocket | null>(null)
  const [cardStates, setCardStates] = useState<boolean[]>([])

  useEffect(() => {
    const socket = new WebSocket('wss://localhost:4000/button')
  })

  return (
    <Container size={'xl'} >
      <Box mb={40}>
        <Title>Chat Moderation</Title>
        <Text c='dimmed' size='md'>Manage chat restrictions and spam filters</Text>
      </Box>

      <SimpleGrid cols={{md: 3, xs: 1}} spacing={'lg'}>
        <ModerationPanelCard icon={IconCancel} title={'Blacklist Words/Phrases'} 
        description='This filter allows you to timeout custom words, phrases, and patterns.' 
        enabled={true}/>

        <ModerationPanelCard icon={IconLetterD} title='Excess Caps' 
        description='This filter allows you to timeout users who use excessive capital letters in messages.' 
        enabled={false} />

        <ModerationPanelCard icon={IconMoodSmile} title='Excess Emotes' 
        description='This filter allows you to timeout users who use excessive emotes.' 
        enabled={false} />

        <ModerationPanelCard icon={IconLinkFilled} title='Links' 
        description='This filter allows you to timeout and whitelist links.' 
        enabled={false} />

        <ModerationPanelCard icon={IconCodeAsterisk} title='Excess Symbols' 
        description='This filter allows you to timeout users spamming excessive symbols.' 
        enabled={false} />

        <ModerationPanelCard icon={IconRepeat} title='Repetitions' 
        description='This filter allows you to timeout users that repeat words or phrases.' 
        enabled={false} />
      </SimpleGrid>
    </Container>
  );
};

export default ChatModeration;