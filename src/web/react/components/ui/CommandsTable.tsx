import { useEffect, useState } from "react"
import classes from './CommandsTable.module.css'
import { Switch, Table } from "@mantine/core";
import { useAuth } from '../../contexts/AuthContext'

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
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:4000/public/commands.json')
                if (!response. ok) {
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
        <Table className={classes.link}>
            <Table.Thead>
                <Table.Tr>
                    {isAuthenticated && <Table.Th>Enabled</Table.Th>}
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Aliases</Table.Th>
                    <Table.Th>Description</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data.map((item) => (
                    <Table.Tr key={item.id}>
                        {isAuthenticated && <Table.Td><Switch withThumbIndicator checked={item.enabled} onChange={(_event) => toggleRow(item.id)} /></Table.Td>}
                        <Table.Td>{item.name}</Table.Td>
                        <Table.Td>{item.aliases.join(', ')}</Table.Td>
                        <Table.Td>{item.description}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )
}