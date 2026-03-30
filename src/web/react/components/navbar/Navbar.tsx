import {
  IconAdjustments,
  IconConfettiFilled,
  IconGauge,
  IconLock,
  IconLogout2,
  IconMoon,
  IconMusicBolt,
  IconSettings,
  IconSun,
  IconTerminal2,
} from '@tabler/icons-react';
import { Code, Group, Menu, ScrollArea, Text } from '@mantine/core';
import { LinksGroup } from './navbar-group/NavbarLinksGroup';
import { UserButton } from './user-button/UserButton';
import { Logo } from './Logo';
import classes from './Navbar.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { LoginButton } from './login-button/LoginButton';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

const mockdata = [
  // TODO: if you're logged out, dashboard should take you to login
  // otherwise dashboard should auto load when you load the page
  { label: 'Dashboard', icon: IconGauge },
  // {
  //   label: 'Dashboard',
  //   icon: IconGauge,
  //   links: [
  //     { label: 'Logs', link: '/' },
  //     { label: 'Chat Moderation', link: '/' },
  //   ],
  // },
  {
    label: 'Giveaways',
    icon: IconConfettiFilled,
  },
  { label: 'Commands', icon: IconTerminal2, link: '/commands' },
  { label: 'Song Requests', icon: IconMusicBolt },
  { label: 'Settings', icon: IconAdjustments },
  {
    label: 'Security',
    icon: IconLock,
    links: [
      { label: 'Change password', link: '/' },
    ],
  },
];

interface NavbarProps {
  colorScheme: string
  toggleColorScheme: () => void
}

export function Navbar({colorScheme, toggleColorScheme}: NavbarProps) {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
      console.log('logging out')
      await logout()
      navigate('/')
      notifications.show({
          message: 'You have successfully logged out.'
      })
  }

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