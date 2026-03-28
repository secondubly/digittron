// import { useEffect, useState, useRef } from 'react'
import { Navbar } from "./components/navbar/Navbar"
import { useMantineColorScheme, useComputedColorScheme, AppShell, Burger, Group, Stack, ActionIcon, useMantineTheme } from "@mantine/core"
import { useDisclosure, useMediaQuery} from '@mantine/hooks'
import AppRoutes from "./Router"
import { NavLink } from "react-router-dom";
// @ts-expect-error false positive error
import classes from './styles/AppShell.module.css';
import { IconMoon, IconSunHigh } from "@tabler/icons-react";

export default function MyApp() {
    // const [audioUrl, setAudioURL] = useState<string | null>(null)
    const { setColorScheme } = useMantineColorScheme({
        keepTransitions: true
    });
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const toggleColorScheme = () => {
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
    }
    const [opened, { toggle }] = useDisclosure()
    const isMediumScreenOrLarger = useMediaQuery('(min-width: 62em)')

    const theme = useMantineTheme();
    return ( 
        <AppShell
            header={{ height: 60, collapsed: isMediumScreenOrLarger }}
            navbar={{ width: {desktop: 'fit-content', mobile: '100%'}, breakpoint: 'sm', collapsed: { desktop: false, mobile: !opened } }}
            padding="md"
            classNames={{
                navbar: classes.nav,
                main: classes.main
            }}
        >
            <AppShell.Header hiddenFrom="md">
                <Group h="100%" px="md" justify="space-between">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <ActionIcon size='md' color='orange' radius='sm' onClick={toggleColorScheme} className='theme-toggle' style={{ width: '3.125rem', height: '3.125rem', background: 'transparent' }}>
                        {computedColorScheme === 'dark' ? <IconMoon color={theme.colors.indigo[0]} size={20} /> : 
                        <IconSunHigh color={theme.colors.yellow[6]} size={20} />}
                    </ActionIcon>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar className={'navbar'}>
                <AppShell.Section visibleFrom="md">
                    <Navbar />
                </AppShell.Section>
                <Stack
                    bg="var(--mantine-color-body)"
                    align="stretch"
                    justify="center"
                    gap="md"
                    hiddenFrom="md"
                    w='100%'
                >
                <NavLink to='/' className='mobile-nav-link'>Home</NavLink>
                <NavLink to='/' className='mobile-nav-link'>Commands</NavLink>
                <NavLink to='/' className='mobile-nav-link'>Song Requests</NavLink>
                <NavLink to='/' className='mobile-nav-link'>Moderation</NavLink>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main ml={{ s: 0, md: 'calc(18.75rem * var(--mantine-scale))'}}>
                <AppRoutes />
            </AppShell.Main>
        </AppShell>
    )
}