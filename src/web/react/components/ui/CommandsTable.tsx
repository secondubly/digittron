import { useEffect, useState } from "react"
import classes from './CommandsTable.module.css'
import { Box, Switch, Table, Pill, Text, Stack, ActionIcon, rem, Menu, Group, alpha, Paper } from "@mantine/core";
import { useAuth } from '../../contexts/AuthContext'
import { IconDotsVertical } from "@tabler/icons-react";

interface Command {
    id: number;
    name: string;
    aliases: string[],
    description: string,
    enabled: boolean,
    permissions?: string[]
}

export const CommandsTable = () => {
    const [data, setData] = useState<Command[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth()

    const toggleRow = (id: number) => {
        setData((current) => current.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item))
    }

    const setPillStyle = (text: string) => {
        switch (text.toLocaleLowerCase()) {
            case 'everyone':
                return { backgroundColor: alpha('var(--mantine-color-primary)', 0.75), color: alpha('var(--mantine-color-white)', 0.75) }
            case 'moderator':
                return { backgroundColor: 'var(--mantine-color-green-8)', color: 'var(--mantine-color-white)' }
            case 'broadcaster':
                return { backgroundColor: 'rgba(205, 135, 135, 0.85)', color: '#FFE3E3' }
        }
    }
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:4000/public/commands.json')
                if (!response.ok) {
                    throw new Error (`Error fetching data: ${response.status}`)
                }

                const jsonData = await response.json()
                const commands: Command[] = jsonData.filter((c: Command) => isAuthenticated ? c : c.enabled)
                setData(commands)
                setError(null)
            } catch (err) {
                setError(err.message)
                setData([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div>Loading data...</div>
        )
    }
    
    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <Paper withBorder>
            <Table className={classes.link} visibleFrom="md">
                <Table.Thead>
                    <Table.Tr>
                        {isAuthenticated && <Table.Th>Enabled</Table.Th>}
                        <Table.Th>Command</Table.Th>
                        <Table.Th>Aliases</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>User Level</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((item) => (
                        <Table.Tr key={item.id}>
                            {isAuthenticated && <Table.Td><Switch withThumbIndicator checked={item.enabled} onChange={(_event) => toggleRow(item.id)} /></Table.Td>}
                            <Table.Td miw={'12em'} p='sm'>!{item.name}</Table.Td>
                            <Table.Td miw={'12em'}>{item.aliases.map((a) => `!${a}`).join(', ')}</Table.Td>
                            <Table.Td>{item.description}</Table.Td>
                            <Table.Td>{item.permissions ? <Pill radius='sm' fw='700' style={setPillStyle(item.permissions[0])}>{item.permissions[0]}</Pill> : <Pill radius='sm' fw='700' style={setPillStyle('Everyone')}>Everyone</Pill>}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            
            <Table stickyHeader width='100%' hiddenFrom="md">
                <Table.Thead bg={'transparent'}>
                    <Table.Tr>
                        <Table.Th colSpan={2}>
                            Command
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((item) => (
                    <Table.Tr key={item.id}>
                        <Table.Td>
                            <Stack>
                                <Text>!{item.name}</Text>
                                <Group>
                                {
                                    item.aliases.map((a) => {
                                        return (<Pill w={'auto'}>${a}</Pill>)
                                    })
                                }
                                </Group>
                                <Text>{item.description}</Text>
                            </Stack>
                        </Table.Td>
                        {isAuthenticated && <Table.Td>
                            <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                    <IconDotsVertical style={{ width: rem(20), height: rem(20) }} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item>
                                Edit
                                </Menu.Item>
                                <Menu.Item 
                                color="red">
                                Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                            </Menu>
                        </Table.Td> }
                    </Table.Tr>
                    ))}  
                </Table.Tbody>
            </Table>
        </Paper>
    )
}