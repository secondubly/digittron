import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Button, Group, LoadingOverlay, Modal, PasswordInput, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
// @ts-expect-error false positive error
import classes from './UserButton.module.css';
// @ts-expect-error false positive error
import placeholder from '../../../assets/images/h_jjk.jpg'
import { useAuth } from '../../../contexts/AuthContext';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Credentials } from '../../../types/loginTypes';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

interface Credentials {
    username: string
    password: string
}


export function UserButton() {

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

    if (isAuthenticated) {
      // TODO: when not logged in, this should display login text
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

        <UnstyledButton className={classes.user} p="md" onClick={handleLogout}>
          <Group>
            <Avatar
              src={placeholder}
              radius="xl"
              alt="Harriette Spoonlicker"
            />


            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                Hiromi Higuruma
              </Text>

              <Text c="dimmed" size="xs">
                hiromihiguruma@outlook.jp
              </Text>
            </div>

            <IconChevronRight size={14} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </>
      )
    } else {
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
          <UnstyledButton className={classes.user} p="md" onClick={open}>
            <Group>
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
}