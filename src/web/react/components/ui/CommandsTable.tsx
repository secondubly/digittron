import { useEffect, useState } from "react"
import classes from './CommandsTable.module.css'
import { Table } from "@mantine/core";
export const CommandsTable = () => {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
            const response = await fetch('http://localhost:4000/public/commands.json')
            if (!response. ok) {
                throw new Error (`Error fetching data: ${response.status}`)
            }

            const jsonData = await response.json()
            setData(jsonData)
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
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Aliases</Table.Th>
                    <Table.Th>Description</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data.map((item) => (
                    <Table.Tr key={item.id}>
                        <Table.Td>{item.name}</Table.Td>

                        <Table.Td>{item.aliases.join(', ')}</Table.Td>
                        <Table.Td>{item.description}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )
}