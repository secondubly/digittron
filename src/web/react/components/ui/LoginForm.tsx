import React from "react";
import { Stack,  PasswordInput, TextInput, ActionIcon, Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLogin2, IconLogout2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
const LoginForm: React.FC = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
        username: '',
        password: ''
    }
    });
    const isLoggedIn = false

    return (
        <>
            <Modal opened={opened} onClose={close} title='Login to your Account' centered>
                <form onSubmit={form.onSubmit((values) => console.log(values))}>
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

                        <Button type="submit" w='fit-content' style={{'align-self': 'flex-end'}}>Submit</Button>
                    </Stack>
            </form>
            </Modal>

            <ActionIcon size='xl' radius='sm' onClick={open}>
            { isLoggedIn ? <IconLogout2 /> : <IconLogin2 /> }
            </ActionIcon>
        </>
    )
}

export default LoginForm