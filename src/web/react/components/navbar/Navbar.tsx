import {
  IconConfettiFilled,
  IconGauge,
  IconLogout2,
  IconMoon,
  IconMusicBolt,
  IconShieldFilled,
  IconSun,
  IconTerminal2,
} from '@tabler/icons-react';
import { Code, Group, Menu, NavLink as MantineNavLink, ScrollArea, Text, ThemeIcon } from '@mantine/core';
import { UserButton } from './user-button/UserButton';
import { Logo } from './Logo';
import classes from './Navbar.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { LoginButton } from './login-button/LoginButton';
import { useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

const linkData = [
  // TODO: if you're logged out, dashboard should take you to login
  // otherwise dashboard should auto load when you load the page
  { label: 'Dashboard', icon: IconGauge, link: '/dashboard' },
  {
    label: 'Giveaways',
    icon: IconConfettiFilled,
    link: '/giveaways'
  },
  { label: 'Commands', icon: IconTerminal2, link: '/commands' },
  { label: 'Song Requests', icon: IconMusicBolt, link: '/song_requests' },
  { label: 'Chat Moderation', icon: IconShieldFilled, link: '/chat_moderation' },
];

interface NavbarProps {
  colorScheme: string
  toggleColorScheme: () => void
}

export function Navbar({colorScheme, toggleColorScheme}: NavbarProps) {
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
      await logout()
      navigate('/')
      notifications.show({
          message: 'You have successfully logged out.'
      })
  }

  const links = linkData.map((item) => (
        <>
        <MantineNavLink 
          key={item.label}
          label={item.label} 
          renderRoot={(props) => <RouterNavLink to={item.link} {...props} />}
          leftSection={
            <ThemeIcon variant="light" size={30}>
              <item.icon size={18} />
            </ThemeIcon>
          } />
      </>
  ));

  return (
      <>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: 120 }} />
          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      {/* Login Footer */}
      <div className={classes.footer}>
        { isAuthenticated &&
         <Menu withArrow position="right-end" arrowPosition='center'>
          <Menu.Target>
            <UserButton />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={colorScheme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />} 
            closeMenuOnClick={false} onClick={toggleColorScheme}>
                <Text size={'sm'}>
                    {colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Text>
            </Menu.Item>
            <Menu.Item leftSection={<IconLogout2 size={14} />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>}

        {
          !isAuthenticated &&
          <LoginButton />
        }
      </div>
    </>
  );
}