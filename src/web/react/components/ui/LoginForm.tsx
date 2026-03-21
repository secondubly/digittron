import React, { useState } from "react";
import { Stack,  PasswordInput, TextInput, ActionIcon, Modal, Button, LoadingOverlay, Text, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from '@mantine/notifications'
import { IconLogin2, IconLogout2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Credentials } from '../../types/loginTypes'
import { useNavigate } from "react-router-dom"; 
import { useAuth } from '../../contexts/AuthContext'

const LoginForm = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const [visible, { open: loaderOpen, close: loaderClose }] = useDisclosure(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login, logout, isAuthenticated } = useAuth()
    const form = useForm<Credentials>({
    mode: 'uncontrolled',
    initialValues: {
        username: '',
        password: ''
    }
    });

    const handleSubmit = async (values: Credentials) => {
        try {
            loaderOpen()
            await login(values)
            close()
        } catch(e) {
            if (e instanceof Error) {
                setError(e.message || 'An error occurred during login.')
            }
        } finally {
            loaderClose()
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
        notifications.show({
            message: 'You have successfully logged out.'
        })
    }

    
    return (
        <>
            <Modal opened={opened} onClose={close} title='Login to your Account' centered>
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
                        
                        <Group justify="space-between">
                        {
                            error && (
                                <Text size="sm" c="red">{error}</Text>
                            )
                        }

                        <Button type="submit" w='fit-content' 
                        style={{'alignSelf': 'flex-end'}} 
                        disabled={visible}>Log In</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <ActionIcon size='xl' radius='sm' onClick={isAuthenticated ? handleLogout : open}>
            { isAuthenticated ? <IconLogout2 /> : <IconLogin2 /> }
            </ActionIcon>
        </>
    )
}

export default LoginForm