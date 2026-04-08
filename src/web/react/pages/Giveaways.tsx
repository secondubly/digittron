import { Text, Container, Box, Title, Paper, Group, useComputedColorScheme } from '@mantine/core';
import React from 'react';
import { SetupForm } from '../components/giveaways/setup_form/SetupForm';

const Giveaways: React.FC = () => {

const colorScheme = useComputedColorScheme()


  return (
    <Container size={'xl'} p={'lg'}>
        <Box id="heading">
            <Title>Giveaway</Title>
            <Text>Create and manage giveaways</Text>
        </Box>
        <Group grow={true} align='stretch' flex={1}>
            <Paper shadow='xs' p={'md'}>
                <SetupForm />
            </Paper>
            <Paper shadow='xs'>
                {colorScheme === 'light' && <iframe src="https://www.twitch.tv/embed/secondubly/chat?parent=localhost" className={'twitch-iframe'}></iframe>}
                {colorScheme === 'dark' && <iframe src="https://www.twitch.tv/embed/secondubly/chat?darkpopout&parent=localhost" className={'twitch-iframe'}></iframe>}
            </Paper>
        </Group>
    </Container>
  );
};

export default Giveaways;