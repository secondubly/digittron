import { Box, Collapse, NumberInput, UnstyledButton, Paper, Group, Title, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react";

export const LuckSettings: React.FC<{participants: string[]}> = ({ participants }) => {
    const [expanded, { toggle }] = useDisclosure(false)

    return (
        <>
        <Box>
            <UnstyledButton onClick={toggle} display={'flex'}>
                {!expanded && <IconChevronDown />}
                {expanded && <IconChevronUp />}
                <Text>{expanded ? 'Hide luck modifier settings' : 'Show luck modifier settings'}</Text>
            </UnstyledButton>
        </Box>
        <Collapse in={expanded} transitionTimingFunction="linear">
                {participants?.map((p) => (
                    <Paper p='md' radius='sm' withBorder={true} display='flex' style={{flexDirection: 'column'}} mb={'md'}>
                        <Group wrap="wrap" align="center" justify="space-between" gap='sm'>
                            <Box>
                                <Title order={5} style={{'fontWeight': 'bolder', 'textTransform': 'capitalize'}}>{p} Luck Modifier</Title>
                            </Box>
                            <Box>
                                <NumberInput leftSection={<IconX />} variant="filled" defaultValue={1} min={1} max={10}/>
                            </Box>
                        </Group>
                    </Paper>
                ))}
        </Collapse>
        </>
    )
}