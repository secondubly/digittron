import React from "react";
import { Stack,  PasswordInput, TextInput, ActionIcon, Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLogin2, IconLogout2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import type { Token } from '../../types/TokenInterface'


interface Props {
    setToken: (token: Token) => void
    removeToken: () => void
    isLoggedIn: boolean
}
interface Credentials {
    username: string
    password: string
}
const LoginForm: React.FC<Props> = ({ setToken, removeToken, isLoggedIn }) => {
    const [opened, { open, close }] = useDisclosure(false);
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
        console.log(token)
        setToken(token)
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

            <ActionIcon size='xl' radius='sm' onClick={isLoggedIn ? open : removeToken}>
            { isLoggedIn ? <IconLogout2 /> : <IconLogin2 /> }
            </ActionIcon>
        </>
    )
}

export default LoginForm