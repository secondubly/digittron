import React, { useState } from "react";
import { Stack,  PasswordInput, TextInput, Button, LoadingOverlay, Text, Group } from "@mantine/core";
import { matchesField, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

interface RegistrationCredentials {
    username: string
    password: string
    confirmPass: string
}

type NewUser = Omit<RegistrationCredentials, 'confirmPass'>

const RegistrationForm = () => {
    const [visible, { open: loaderOpen, close: loaderClose }] = useDisclosure(false);
    const [error, setError] = useState<string | null>(null);
    const form = useForm<RegistrationCredentials>({
    mode: 'uncontrolled',
    initialValues: {
        username: '',
        password: '',
        confirmPass: ''
    },
    validate: {
        password: (value) => value.length < 6 ? 'Password must be at least six characters' : null,
        confirmPass: matchesField('password', 'Passwords do not match')
    }
    });

    const createUser = async (credentials: NewUser) => {
        const response = await fetch('http://localhost:4000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })


        const data = await response.json()
        if (response.status === 401) {
            throw new Error('Invalid username or password')
        } else if (!response.ok) {
            throw new Error
        }

        return data.token
    }

    const handleSubmit = async (values: RegistrationCredentials) => {
        try {
            loaderOpen()
            const { confirmPass, ...newValues } = values
            createUser(newValues)
        } catch(e) {
            if (e instanceof Error) {
                setError(e.message || 'An error occurred during login.')
            }
        } finally {
            loaderClose()
        }
    }
    
    return (
        <>
            <LoadingOverlay h={'100%'} visible={visible} loaderProps={{ children: 'Loading...' }} />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack                     
                gap='md'
                h='fit-content'>
                    <TextInput
                    label="Username"
                    placeholder="username"
                    key={form.key('username')}
                        {...form.getInputProps('username')} 
                    required />

                    <PasswordInput
                        label="Password"
                        placeholder="password"
                        key={form.key('password')}
                        {...form.getInputProps('password')}
                        required
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="password"
                        key={form.key('confirmPass')}
                        {...form.getInputProps('confirmPass')}
                        required
                    />
                    
                    <Group justify="space-between">
                    {
                        error && (
                            <Text size="sm" c="red">{error}</Text>
                        )
                    }

                    <Button type="submit" w='fit-content' 
                    style={{'alignSelf': 'flex-end'}} 
                    disabled={visible}>Submit</Button>
                    </Group>
                </Stack>
            </form>
        </>
    )
}

export default RegistrationForm