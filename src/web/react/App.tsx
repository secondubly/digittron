// import { useEffect, useState, useRef } from 'react'
import { NavbarMinimal } from "./components/navbar/Navbar"
import { useMantineColorScheme, useComputedColorScheme, AppShell, Burger, Group, Stack } from "@mantine/core"
import { useDisclosure, useMediaQuery} from '@mantine/hooks'
import AppRoutes from "./Router"
import { NavLink } from "react-router-dom";
import classes from './styles/AppShell.module.css';

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
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                </Group>
            </AppShell.Header>

            <AppShell.Navbar>
                <AppShell.Section visibleFrom="md">
                    <NavbarMinimal colorScheme={computedColorScheme} toggleColorScheme={toggleColorScheme} />
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

            <AppShell.Main ml={{ s: 0, md: '10em'}}>
                <AppRoutes />
            </AppShell.Main>
        </AppShell>
    )
}