import { Box, Combobox, Input, InputBase, Paper, Stack, Switch, Text, Title, useCombobox } from "@mantine/core"
import { LuckSettings } from "./LuckSettings"
import type { GiveawayFormValues } from '../../../../lib/types'
import type { UseFormReturnType } from "@mantine/form"
import { useState } from "react"


interface TimelimitInterface {
    value: string
    label: string
}

const timeoutLimits: TimelimitInterface[] = [{
    label: '1 minute',
    value: '60000'
},
{
    label: '5 minutes',
    value: '300000'
},
{
    label: '10 minutes',
    value: '600000'
},
{
    label: '15 minutes',
    value: '9000000'
}]

export const ActiveChatterFormStep: React.FC<{ form: UseFormReturnType<GiveawayFormValues> }> = ({ form }) => {
    const [timelimit, setTimeLimit] = useState<string | null>(null)
    const selectedOption = timeoutLimits.find((item) => item.value === timelimit)
    const [uniqueWinners, setUniquerWinners] = useState(true)
    const [announceWinner, setAnnounceWinner] = useState(false)

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })
    return (
        <Stack>
            <Paper p='md' radius='sm' display={'flex'} style={{'flexDirection': 'column'}}>
                        <Box>
                            <Title order={5} style={{'fontWeight': 'bolder'}}>Activity Timeout</Title>
                            <Text size="sm" mb={'sm'}>Minimum amount of time a user must be active in chat to be eligible</Text>
                        </Box>
                        <Combobox store={combobox}
                            onOptionSubmit={(val) => {
                                console.log(val)
                                setTimeLimit(val)
                                combobox.closeDropdown()
                            }}>
                                <Combobox.Target>
                                    <InputBase
                                        component="button"
                                        type="button"
                                        pointer
                                        rightSection={<Combobox.Chevron />}
                                        rightSectionPointerEvents="none"
                                        onClick={() => combobox.toggleDropdown()}
                                    >
                                        {selectedOption?.label || <Input.Placeholder>Pick a time</Input.Placeholder>}
                                    </InputBase>
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>{timeoutLimits.map((t) => (
                                        <Combobox.Option value={t.value} key={t.value}>
                                            {t.label}
                                        </Combobox.Option>
                                    ))}</Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
            </Paper>
            <Paper p='md' radius='sm' display='flex' style={{flexDirection: 'column'}} >
                <Box>
                    <Title order={5} style={{'fontWeight': 'bolder'}}>Unique Winners</Title>
                    <Text size="sm" mb={'sm'}>Whether giveaway winners are removed from the pool after winning</Text>
                </Box>
                <Switch withThumbIndicator checked={uniqueWinners} style={{alignSelf: 'flex-end'}} onChange={() => setUniquerWinners(!uniqueWinners)}/>
            </Paper>
            <Paper p='md' radius='sm' display='flex' style={{flexDirection: 'column'}} >
                <Box>
                    <Title order={5} style={{'fontWeight': 'bolder'}}>Chat Announcement</Title>
                    <Text size="sm" mb={'sm'}>Announce winners in chat</Text>
                </Box>
                <Switch withThumbIndicator checked={announceWinner} style={{alignSelf: 'flex-end'}} onChange={() => setAnnounceWinner(!announceWinner)}/>
            </Paper>
            <LuckSettings participants={form.getValues().participants || []}/>
        </Stack>
    )
}