import { Box, Checkbox, SimpleGrid, Stack, Text } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { ParticipantCheckbox } from '../../../../lib/types'

interface GiveawayFormValues {
  giveawayType: string
  participants?: string[]
}

interface CheckboxGroupProps {
  description: string
  participants: ParticipantCheckbox[]
  form: UseFormReturnType<GiveawayFormValues>
}

export const SetupFormStepTwo = ({
  participants,
  form,
}: CheckboxGroupProps) => {
  return (
    <Stack>
      <Checkbox.Group
        label="Select who can participate in the giveaway"
        {...form.getInputProps('participants')}
      >
        <SimpleGrid cols={2}>
          {participants.map((participant) => (
            <Checkbox.Card
              key={participant.value}
              value={participant.value}
              display="flex"
              style={{ gap: '1em' }}
              p="md"
            >
              <Checkbox.Indicator />
              <Box>
                <Text>{participant.label}</Text>
              </Box>
            </Checkbox.Card>
          ))}
        </SimpleGrid>
      </Checkbox.Group>
    </Stack>
  )
}
