import { Navbar } from './components/navbar/Navbar'
import {
  useMantineColorScheme,
  useComputedColorScheme,
  AppShell,
  Burger,
  Group,
  Stack,
  ActionIcon,
  useMantineTheme,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import AppRoutes from './Router'
import { NavLink } from 'react-router-dom'
import classes from './styles/AppShell.module.css'
import { IconMoon, IconSunHigh } from '@tabler/icons-react'

export default function MyApp() {
  const { setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  })
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  })
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }
  const [opened, { toggle }] = useDisclosure()
  const isMediumScreenOrLarger = useMediaQuery('(min-width: 62em)')

  const theme = useMantineTheme()
  return (
    <AppShell
      header={{ height: 60, collapsed: isMediumScreenOrLarger }}
      navbar={{
        width: { desktop: 'fit-content', mobile: '100%' },
        breakpoint: 'sm', // switch to mobile below this breakpoint
        collapsed: { mobile: !opened },
      }} // hide navbar on mobile unless toggled
      padding="md"
      classNames={{
        navbar: classes.nav,
        main: classes.main,
      }}
    >
      <AppShell.Header hiddenFrom="md">
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <ActionIcon
            size="md"
            color="orange"
            radius="sm"
            onClick={toggleColorScheme}
            className="theme-toggle"
            style={{
              width: '3.125rem',
              height: '3.125rem',
              background: 'transparent',
            }}
          >
            {computedColorScheme === 'dark' ? (
              <IconMoon color={theme.colors.indigo[0]} size={20} />
            ) : (
              <IconSunHigh color={theme.colors.yellow[6]} size={20} />
            )}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={'navbar'}>
        {/* Desktop Navigation */}
        <AppShell.Section visibleFrom="md">
          <Navbar
            colorScheme={computedColorScheme}
            toggleColorScheme={toggleColorScheme}
            theme={theme}
          />
        </AppShell.Section>

        {/* Mobile navigation */}
        <Stack
          bg="var(--mantine-color-body)"
          align="stretch"
          justify="center"
          gap="md"
          hiddenFrom="md"
          w="100%"
        >
          <NavLink to="/" className="mobile-nav-link">
            Home
          </NavLink>
          <NavLink to="/giveaways" className="mobile-nav-link">
            Giveaways
          </NavLink>
          <NavLink to="/commands" className="mobile-nav-link">
            Commands
          </NavLink>
          <NavLink to="/song_requests" className="mobile-nav-link">
            Song Requests
          </NavLink>
          <NavLink to="/chat_moderation" className="mobile-nav-link">
            Moderation
          </NavLink>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        ml={{ s: 0, md: 'calc(18.75rem * var(--mantine-scale))' }}
        flex={1}
        display={'flex'}
        style={{ flexDirection: 'column' }}
      >
        <AppRoutes />
      </AppShell.Main>
    </AppShell>
  )
}
