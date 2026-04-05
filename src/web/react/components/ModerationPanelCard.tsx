import { Card, Divider, Flex, Group, Stack, Switch, Text, Title } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
    icon: typeof IconHome
    title: string
    description: string
    enabled: boolean
}

export const ModerationPanelCard = ({ icon: IconComponent, title, description, enabled: on }: Props) => {
    const [enabled, setEnabled] = useState(on)
    return (
        <Card radius={'sm'} p={0}>
            <Stack>
                <Flex gap={'sm'} align={'flex-start'} p={25}>
                    <IconComponent className="moderation-icon" size={18} />
                    <Stack gap={'xs'}>
                        <Title size={'md'} fw={'bold'}>{title}</Title>
                        <Text>{description}</Text>
                    </Stack>
                </Flex>
                <Divider />
                <Group px={24} py={10} align={'center'}>
                    <Switch withThumbIndicator checked={enabled} 
                    label={enabled ? 'Enabled' : 'Disabled'}
                    onChange={(event) => (setEnabled(event.currentTarget.checked))} />
                </Group>
            </Stack>
        </Card>
    )
}