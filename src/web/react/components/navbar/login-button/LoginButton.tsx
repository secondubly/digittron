import { Modal, LoadingOverlay, TextInput, Group, Button, Stack, UnstyledButton, PasswordInput, Text } from "@mantine/core"
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import classes from './LoginButton.module.css'
import { notifications } from "@mantine/notifications";

interface Credentials {
    username: string
    password: string
}

export const LoginButton = () => {
    const form = useForm<Credentials>({
      mode: 'uncontrolled',
      initialValues: {
          username: '',
          password: ''
      }
    });

    const [opened, { open, close }] = useDisclosure(false);
    const [visible, { open: loaderOpen, close: loaderClose }] = useDisclosure(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth()

    const handleSubmit = async (values: Credentials) => {
        try {
            loaderOpen()
            await login(values)
            notifications.show({
                message: 'You have been logged in!',
                autoClose: 1000
            })
            close()
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
                        <Text size="sm" c="red" style={{ display: error !== null ? 'hidden' : 'block'}}>{error}</Text>

                        <Button type="submit" w='fit-content' 
                        style={{'alignSelf': 'flex-end'}} 
                        disabled={visible}>Log In</Button>
                    </Group>
                </Stack>
            </form>
          </Modal>
          <UnstyledButton className={classes.button} p="md" onClick={open}>
            <Group className={classes.group}>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  Login
                </Text>
              </div>

              <IconChevronRight size={14} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </>
    )
}