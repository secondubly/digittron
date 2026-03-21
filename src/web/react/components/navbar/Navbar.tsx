import { useState } from 'react';
import {
  IconHome2,
  IconSunHigh,
  IconMoon
} from '@tabler/icons-react';
import { ActionIcon, Stack, Tooltip, UnstyledButton, useMantineTheme } from '@mantine/core';
// @ts-expect-error false positive error
import classes from './Navbar.module.css'
import * as Icons from '../icons'
import { Link } from 'react-router-dom'
import LoginForm from '../ui/LoginForm';
import type { Token } from '../../types/loginTypes'

interface NavbarLinkProps {
  id: number,
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
  path: string
}

interface ThemeProps {
  colorScheme: string,
  toggleColorScheme: () => void
  setToken: (token: Token) => void
  removeToken: () => void
  isLoggedIn: boolean
}

function NavbarLink({ icon: Icon, label, active, onClick, path }: NavbarLinkProps) {

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link to={path}>
        <UnstyledButton
          onClick={onClick}
          className={classes.link}
          data-active={active || undefined}
          aria-label={label}
        >
            <Icon size={20} stroke={1.5} />
        </UnstyledButton>
      </Link>
    </Tooltip>
  );
}

const route_icons = [
  { id: 1, icon: Icons.HomeIcon, label: 'Home', path: '/' },
  { id: 2, icon: Icons.CommandsIcon, label: 'Commands', path: '/commands' },
  { id: 3, icon: Icons.SongRequestIcon, label: 'Song Requests', path: '/song_requests'},
  { id: 4, icon: Icons.ModerationIcon, label: 'Moderation', path: '/moderation'},
];

export function NavbarMinimal({ colorScheme, toggleColorScheme, setToken, removeToken, isLoggedIn }: ThemeProps) {
  const [active, setActive] = useState(0);


  const links = route_icons.map((link, index) => (
    // @ts-expect-error false positive error
    <NavbarLink
    {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  const theme = useMantineTheme();
  return (
    
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" align='center' gap={'--mantine-spacing-md'}>
        <ActionIcon size='md' color='orange' radius='sm' onClick={toggleColorScheme} className='theme-toggle' style={{ width: '3.125rem', height: '3.125rem', background: 'transparent' }}>
          {colorScheme === 'dark' ? <IconMoon color={theme.colors.indigo[0]} size={20} /> : 
            <IconSunHigh color={theme.colors.yellow[6]} size={20} />}
        </ActionIcon>
        <LoginForm />
      </Stack>
    </nav>
  );
}