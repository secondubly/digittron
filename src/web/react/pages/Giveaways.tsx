import { Text, Container, Box, Title, Paper, Group, useComputedColorScheme } from '@mantine/core';
import { IconMessageFilled, IconNumber123, IconUserFilled } from '@tabler/icons-react';
import React from 'react';
import { GiveawayCard } from '../components/giveaways/GiveawayCard';
import { GiveawayRadioGroup } from '../components/giveaways/GiveawayRadioGroup';

const Giveaways: React.FC = () => {

    const colorScheme = useComputedColorScheme()
    const options = [
        {
            icon: IconUserFilled,
            title: 'Active Chatters',
            description: 'Giveaway to active chatters in chat.'
        },
        {
            icon: IconMessageFilled,
            title: 'Keywords',
            description: 'Giveaway to chatters who type a keyword.'
        },
        {
            icon: IconNumber123,
            title: 'Random Number',
            description: 'Giveaway to chatters who guess a number.'
        }
    ]

    const cards = options.map((item) => (
        <GiveawayCard title={item.title} description={item.description} icon={item.icon} />
    ))

  return (
    <Container size={'xl'} p={'lg'}>
        <Box id='heading'>
            <Title>Giveaway</Title>
            <Text>Create and manage giveaways</Text>
        </Box>
        <Group grow={true} align='stretch'>
            <Paper shadow='xs' p={'xl'}>
                <GiveawayRadioGroup cards={cards}/>
            </Paper>
            <Paper shadow='xs'>
                {colorScheme === 'light' && <iframe src="https://www.twitch.tv/embed/secondubly/chat?parent=localhost" className={'twitch-iframe'}></iframe>}
                {colorScheme === 'dark' && <iframe src="https://www.twitch.tv/embed/secondubly/chat?darkpopout&parent=localhost" className={'twitch-iframe'}></iframe>}
            </Paper>
        </Group>
    </Container>
    // <Container size={'xl'} display='flex' style={{flexDirection: 'column'}}>
    //   <Box mb={40}>
    //     <Title>Giveaway</Title>
    //     <Text c='dimmed' size='md'>Create and manage giveaways</Text>
    //   </Box>
    //   <Group flex='1'>
    //     <Paper shadow='xs' p='xl' flex='1'>
    //         <Radio.Group label="Select the type of giveaway to run." styles={{ label: { marginBottom: '2rem'} }}>
    //             <Stack>
    //                 {cards}
    //             </Stack>
    //         </Radio.Group>
    //         <Group mt='12em' justify='space-between'>
    //             <Button disabled>Back</Button>
    //             <Button>Next</Button>
    //         </Group>
    //     </Paper>
    //     <Paper flex={'1'}>
    //         <iframe src="https://www.twitch.tv/embed/secondubly/chat?parent=localhost" width='100%' height='100%'></iframe>
    //     </Paper>
    //   </Group>
    // </Container>
  );
};

export default Giveaways;