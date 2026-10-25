import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { alertsUrl } from '../../config'
import { openSocket } from '../../lib/socket'
import { Box, Container, MantineProvider, Title, Table, ScrollArea, Stack } from '@mantine/core'
import '@mantine/core/styles.css'
import classes from './Leaderboard.module.css'
import { mock } from '../../config'
import { SAMPLES } from '../../lib/samples'

interface Row {
    userId: string
    name: string
    firsts: number
}

export default function Leaderboard() {
    const [rows, setRows] = useState<Row[]>([])
    const [scrolled, setScrolled] = useState(false);

    const load = useCallback(async () => {
        if (mock) {
            setRows(SAMPLES.many ?? [])
            return
        } else {
            try {
                const res = await fetch('/api/firsts')
                if (res.ok) setRows((await res.json()) as Row[])
            } catch {
                // server not reachable yet; the socket reconnect below loads again
            }
        }
    }, [])

    useEffect(() => {
        void load()
        if (alertsUrl === 'off') return

        // the bot sends { type: "firsts-updated" } whenever a claim is recorded or refunded
        return openSocket(alertsUrl, {
            onOpen: () => void load(),
            onMessage: (data) => {
                try {
                    if (JSON.parse(data).type === 'firsts-updated') void load()
                } catch {
                    // not JSON, ignore
                }
            },
        })
    }, [load])

    return (
            <Container className={classes.board} size="sm" mt="xl" p='md'>
                <Stack>
                    <Box>
                        <Title ta='center' order={1}>First Leaderboard</Title>
                    </Box>
                    {
                        rows.length === 0 ? (<Box ta='center' className="empty">No firsts yet</Box>) :
                        <ScrollArea h={500} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
                            <Table miw={600}>
                                <Table.Thead className={classes.header} mod={{ scrolled }}>
                                {/* <Table.Thead> */}
                                    <Table.Tr>
                                        <Table.Th>Rank</Table.Th>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Redemptions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {rows.map((row, i) => (
                                        <Table.Tr key={row.userId}>
                                            <Table.Td className={classes.rank}>{i + 1}</Table.Td>
                                            <Table.Td className={classes.name}>{row.name}</Table.Td>
                                            <Table.Td className={classes.count} fw={700}>{row.firsts}</Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    }
                </Stack>
            </Container>
    )
}

createRoot(document.getElementById('root')!).render(
    <MantineProvider>
        <StrictMode>
            <Leaderboard />
        </StrictMode>
    </MantineProvider>,
)