import { Box, Checkbox, SimpleGrid, Stack, Text, Title } from "@mantine/core"
import type { UseFormReturnType } from "@mantine/form";

interface GiveawayFormValues {
    giveawayType: string
    participants?: string[]
}

interface CheckboxItem {
    title: string;
    label: string;
}

interface CheckboxGroupProps {
  label: string;
  description?: string;
  value?: string[];
  options: CheckboxItem[]
  form: UseFormReturnType<GiveawayFormValues>
}

// TODO: move this into SetupFormStepTwo
export const SetupFormPanel = ({ options: participants, description, label, form }: CheckboxGroupProps) => {
    console.log('participants input props', {...form.getInputProps('participants')})
    return (
    <>
    <Stack>
        <Title>
            {description}
        </Title>
            <Checkbox.Group
            label={label}
            description={description}
            {...form.getInputProps('participants')}
            >
                <SimpleGrid cols={2}>
                    {
                        participants.map((participant) => (
                            <Checkbox.Card
                                key={participant.label}
                                value={participant.label}
                                display='flex'
                                style={{'gap': '1em'}}
                                p='md'
                            >
                                    <Checkbox.Indicator />
                                    <Box>
                                        <Text>{participant.title}</Text>
                                    </Box>
                            </Checkbox.Card>
                        ))
                    }
                </SimpleGrid>
            </Checkbox.Group>
    </Stack>
    </>
    )
}