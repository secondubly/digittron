import { Box, Card, Flex, Stack, Text, Title } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";

interface Props {
    icon: typeof IconHome
    title: string
    description: string
    enabled: boolean
}

export const ModerationPanelCard = ({ icon: IconComponent, title, description, enabled }: Props) => {
    return (
        <Card radius={'sm'} padding={25}>
            <Stack>
                <Flex gap={'sm'} align={'flex-start'}>
                    <Box>
                        <IconComponent />
                    </Box>
                    <Stack gap={'xs'}>
                        <Title size={'md'} fw={'bold'}>{title}</Title>
                        <Text>{description}</Text>
                    </Stack>
                </Flex>
            </Stack>
        </Card>
    )
}