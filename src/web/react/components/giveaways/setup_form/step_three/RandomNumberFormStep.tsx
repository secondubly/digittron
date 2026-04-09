import { Box, Group, NumberInput, Paper, Stack, Switch, Text, Title, useCombobox } from "@mantine/core"
import type { GiveawayFormValues } from '../../../../lib/types'
import type { UseFormReturnType } from "@mantine/form"
import { useState } from "react"

export const RandomNumberFormStep: React.FC<{ form: UseFormReturnType<GiveawayFormValues> }> = ({ form }) => {
    const [announceWinner, setAnnounceWinner] = useState(false)
    const [range, setRange] = useState<[number, number]>([1, 100]);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })
    return (
        <Stack>
            <Paper p='md' radius='sm' display={'flex'} style={{'flexDirection': 'column'}}>
                        <Box>
                            <Title order={5} style={{'fontWeight': 'bolder'}}>Random Number Range</Title>
                            <Text size="sm" mb={'sm'}>Select the range of numbers to choose from</Text>
                        </Box>
                        <Box>
                            <Box p="md">
                                <Group grow mb="md">
                                    <NumberInput
                                    value={range[0]}
                                    onChange={(val) => setRange([Number(val), range[1]])}
                                    thousandSeparator=','
                                    label="Min"
                                    />
                                    <NumberInput
                                    value={range[1]}
                                    onChange={(val) => setRange([range[0], Number(val)])}
                                    thousandSeparator=','
                                    label="Max"
                                    />
                                </Group>
                                </Box>
                        </Box>
            </Paper>
            <Paper p='md' radius='sm' display='flex' style={{flexDirection: 'column'}} >
                <Box>
                    <Title order={5} style={{'fontWeight': 'bolder'}}>Chat Announcement</Title>
                    <Text size="sm" mb={'sm'}>Announce winners in chat</Text>
                </Box>
                <Switch withThumbIndicator checked={announceWinner} style={{alignSelf: 'flex-end'}} onChange={() => setAnnounceWinner(!announceWinner)}/>
            </Paper>
        </Stack>
    )
}