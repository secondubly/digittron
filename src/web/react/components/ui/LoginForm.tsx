import React from "react";
import { Stack,  PasswordInput, TextInput, ActionIcon, Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from '@mantine/notifications'
import { IconLogin2, IconLogout2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Credentials, Token } from '../../types/loginTypes'
import { useNavigate } from "react-router-dom";



interface Props {
    setToken: (token: Token) => void
    removeToken: () => void
    isLoggedIn: boolean
}
const LoginForm: React.FC<Props> = ({ setToken, removeToken, isLoggedIn }) => {
    const [opened, { open, close }] = useDisclosure(false);
    const navigate = useNavigate()
    const form = useForm<Credentials>({
    mode: 'uncontrolled',
    initialValues: {
        username: '',
        password: ''
    }
    });

    const loginUser = (credentials: Credentials) => {
        return fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        }).then(data => data.json())
    }

    const handleSubmit = async (values: Credentials) => {
        const token = await loginUser(values)
        if (token) {
            close()
        }
        console.log(token)
        setToken(token)
    }

    const handleLogout = () => {
        removeToken()
        navigate('/home')
        notifications.show({
            message: 'You have successfully logged out.'
        })
    }

    
    return (
        <>
            <Modal opened={opened} onClose={close} title='Login to your Account' centered>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack                     
                    gap='md'
                    h='fit-content'>
                        <TextInput
                        label="Username"
                        placeholder="username"
                        key={form.key('username')}
                            {...form.getInputProps('username')} />

                        <PasswordInput
                            label="Password"
                            placeholder="password"
                            key={form.key('password')}
                            {...form.getInputProps('')}
                        />

                        <Button type="submit" w='fit-content' style={{'alignSelf': 'flex-end'}}>Submit</Button>
                    </Stack>
            </form>
            </Modal>

            <ActionIcon size='xl' radius='sm' onClick={isLoggedIn ? open : handleLogout}>
            { isLoggedIn ? <IconLogout2 /> : <IconLogin2 /> }
            </ActionIcon>
        </>
    )
}

export default LoginForm