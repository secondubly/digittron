import { Card, Flex, Group, Stack, Switch, Text, Title } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'
import { useState } from 'react'

interface Props {
  icon: typeof IconHome
  title: string
  description: string
  enabled: boolean
}

export const ModerationPanelCard = ({
  icon: IconComponent,
  title,
  description,
  enabled: on,
}: Props) => {
  const [enabled, setEnabled] = useState(on)
  return (
    <Card radius={'sm'} p={0} withBorder shadow="sm">
      <Card.Section withBorder p="xs">
        <Flex gap={'sm'} align={'flex-start'} p={25}>
          <IconComponent />
          <Stack gap={'xs'}>
            <Title size={'md'} fw={'bold'}>
              {title}
            </Title>
            <Text>{description}</Text>
          </Stack>
        </Flex>
      </Card.Section>
      <Group px="lg" py="md" align={'center'}>
        <Switch
          size="sm"
          withThumbIndicator
          checked={enabled}
          label={enabled ? 'Enabled' : 'Disabled'}
          onChange={(event) => setEnabled(event.currentTarget.checked)}
        />
      </Group>
    </Card>
  )
}
